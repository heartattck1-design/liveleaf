#include "ws.h"

#include <stdio.h>
#include <string.h>
#include "app/main_app.h"
#include "esp_log.h"
#include "esp_websocket_client.h"
#include "cJSON.h"
#include "fs/nvs_driver.h"
#include "portmacro.h"
#include "freertos/task.h"
#include "../devices/water_pump.h"

#define CHUNK_SIZE 1024 // 1 KB buffer fits comfortably on stack or heap
#define WS_SEND_TIMEOUT   pdMS_TO_TICKS(5000)

static const char *TAG = "LIVELEAF_WS";

esp_websocket_client_handle_t ws_client;

// ---------------------------------------------------------
// WebSocket Event Loop
// ---------------------------------------------------------
static void websocket_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data) {
    esp_websocket_event_data_t *data = (esp_websocket_event_data_t *)event_data;
    
    switch (event_id) {
        case WEBSOCKET_EVENT_CONNECTED:
            ESP_LOGI(TAG, "WebSocket Connected");
            break;
            
            case WEBSOCKET_EVENT_DATA:
            // Ensure data is text (0x01) or continuation (0x09), skip binary
            if (data->op_code != 0x01 && data->op_code != 0x09) break;
            
            // Safety Check: Ensure there is data
            if (data->data_len == 0 || data->data_ptr == NULL) break;
            
            // 1. Engine.IO Handshake response (Server sends '0' + JSON)
            if (data->data_ptr[0] == '0') {
                ESP_LOGI(TAG, "Engine.IO Handshake received. Sending Socket.IO connect (40)...");
                esp_websocket_client_send_text(ws_client, "40", 2, portMAX_DELAY);
                break;
            }
            
            // 2. Engine.IO Ping request (Server sends '2') -> Client must reply with Pong ('3')
            if (data->data_ptr[0] == '2') {
                ESP_LOGI(TAG, "Engine.IO Ping received. Replying with Pong (3)...");
                esp_websocket_client_send_text(ws_client, "3", 1, portMAX_DELAY);
                break;
            }
            
            // 3. Socket.IO Event received (Server sends '42' + Array)
            if (data->data_len >= 2 && strncmp(data->data_ptr, "42", 2) == 0) {
                
                // Safely copy payload to a null-terminated buffer
                int payload_len = data->data_len - 2;
                if (payload_len <= 0) break;

                // Allocate memory dynamically to handle varying payload sizes safely
                char *json_buf = malloc(payload_len + 1);
                if (json_buf == NULL) {
                    ESP_LOGE(TAG, "Failed to allocate memory for JSON payload");
                    break;
                }

                memcpy(json_buf, data->data_ptr + 2, payload_len);
                json_buf[payload_len] = '\0'; // Null-terminate safely

                ESP_LOGI(TAG, "Received Event: %s", json_buf);

                // Parse with cJSON
                cJSON *root = cJSON_Parse(json_buf);
                if (root != NULL && cJSON_IsArray(root) && cJSON_GetArraySize(root) == 2) {

                    cJSON *event_name = cJSON_GetArrayItem(root, 0);
                    cJSON *event_data_obj = cJSON_GetArrayItem(root, 1);

                    if (cJSON_IsString(event_name) && strcmp(event_name->valuestring, "device_command") == 0) {
                        cJSON *action = cJSON_GetObjectItem(event_data_obj, "action");
                        
                        // --- الجديد: استخراج الـ req_id ---
                        cJSON *req_id_obj = cJSON_GetObjectItem(event_data_obj, "req_id");
                        char *req_id = NULL;
                        if (cJSON_IsString(req_id_obj)) {
                            req_id = req_id_obj->valuestring;
                        }
                        if (cJSON_IsString(action)) {
                            esp_err_t exec_status = ESP_OK; // متغير لتتبع حالة نجاح الأمر
                            cJSON *response_data = NULL;    // متغير لحمل البيانات الإضافية في الرد

                            if (strcmp(action->valuestring, "push_sensor_val") == 0){
                                // Get metrics and build JSON for the response
                                Metrics_t data = get_metrics();
                                response_data = cJSON_CreateObject();
                                if (response_data != NULL) {
                                    cJSON_AddNumberToObject(response_data, "temp",  (double)data.temp);
                                    cJSON_AddNumberToObject(response_data, "humi",  (double)data.humidity);
                                    cJSON_AddNumberToObject(response_data, "lamp",  (double)data.ldr);
                                    cJSON_AddNumberToObject(response_data, "soil",  (double)data.soil);
                                    cJSON_AddNumberToObject(response_data, "tank",  (double)data.tank);
                                } else {
                                    exec_status = ESP_FAIL;
                                }
                                
                                // Call the original function to also push to the general stream (optional)
                                push_sensor_data();
                            }
                            else if (strcmp(action->valuestring, "push_sensor_log") == 0){
                                exec_status = push_file_logs_raw("/data/log_metrics.csv");
                            } 
                            else if (strcmp(action->valuestring, "push_watering_log") == 0){
                                exec_status = push_file_logs_raw("/data/log_watering.csv");
                            }
                            else if (strcmp(action->valuestring, "start_watering") == 0){
                                cJSON *event_duration = cJSON_GetObjectItem(event_data_obj, "duration");
                                if (cJSON_IsNumber(event_duration)) {
                                    int duration = (int)event_duration->valuedouble * 1000;
                                    xTaskCreate( start_watering,
                                        "Start Watering",
                                        2048,
                                        (void *)(int)&duration,
                                        3,
                                        NULL );
                                } else {
                                    exec_status = ESP_FAIL;
                                }
                            }
                            else if (strcmp(action->valuestring, "save_plant_data") == 0){
                                cJSON *event_data = cJSON_GetObjectItem(event_data_obj, "data");
                                exec_status = handle_plant_set_info_ws(event_data);
                            } else {
                                exec_status = ESP_FAIL; // أمر غير معروف
                            }

                            // --- إرسال الرد للسيرفر شامل البيانات (إن وجدت) ---
                            if (req_id != NULL) {
                                if (exec_status == ESP_OK) {
                                    send_device_response(req_id, "success", response_data);
                                } else {
                                    send_device_response(req_id, "failed", response_data);
                                }
                            } else if (response_data != NULL) {
                                // If there was no req_id, we need to manually free the unattached JSON
                                cJSON_Delete(response_data); 
                            }
                            // -------------------------------------------------------------
                        }
                    }
                    cJSON_Delete(root);
                } else {
                    ESP_LOGW(TAG, "Failed to parse JSON or unexpected format");
                }
                
                free(json_buf); // Free the safely allocated buffer
            }
            break;

        case WEBSOCKET_EVENT_DISCONNECTED:
            ESP_LOGI(TAG, "WebSocket Disconnected");
            break;
    }
}

static void send_device_response(const char *req_id, const char *status, cJSON *extra_data)
{
    // Clean up extra_data if we can't send
    if (!esp_websocket_client_is_connected(ws_client) || req_id == NULL) {
        if (extra_data) cJSON_Delete(extra_data);
        return;
    }

    cJSON *root = cJSON_CreateObject();
    if (root == NULL) {
        if (extra_data) cJSON_Delete(extra_data);
        return;
    }

    cJSON_AddStringToObject(root, "req_id", req_id);
    cJSON_AddStringToObject(root, "status", status);
    
    // If extra data was passed, attach it to the response under "data"
    if (extra_data != NULL) {
        cJSON_AddItemToObject(root, "data", extra_data);
    }

    char *json_str = cJSON_PrintUnformatted(root);
    if (json_str != NULL) {
        char payload[512]; // Increased size to handle the extra data safely
        snprintf(payload, sizeof(payload), "42[\"device_response\", %s]", json_str);
        
        esp_websocket_client_send_text(ws_client, payload, strlen(payload), portMAX_DELAY);
        ESP_LOGI(TAG, "Sent device_response: %s", payload);
        
        cJSON_free(json_str);
    }
    cJSON_Delete(root); // This safely deletes extra_data as well
}

// ---------------------------------------------------------
// Init & Push Data
// ---------------------------------------------------------
void app_websocket_start(void) {
    nvs_handle_t handle = open_nvs_handle();
    char ws_uri[512];

    int ip_len = read_nvs_str_size(handle, "ip");
    if(ip_len == -1) return;
    int token_len = read_nvs_str_size(handle, "token");
    char ip[ip_len], token[token_len];

    read_nvs_str(handle, ip, "ip", ip_len);
    read_nvs_str(handle, token, "token", token_len);

    snprintf(ws_uri, sizeof(ws_uri), "ws://%s:5000/socket.io/?EIO=4&transport=websocket&token=%s", ip, token);

    esp_websocket_client_config_t websocket_cfg = {
        .uri = ws_uri,
    };

    ws_client = esp_websocket_client_init(&websocket_cfg);
    esp_websocket_register_events(ws_client, WEBSOCKET_EVENT_ANY, websocket_event_handler, (void *)ws_client);
    esp_websocket_client_start(ws_client);
}

// Call this from a FreeRTOS task to periodically send data
void push_sensor_data(void) {
    if (esp_websocket_client_is_connected(ws_client)) {

        char payload[256];

        Metrics_t data = get_metrics();

        cJSON *root = cJSON_CreateObject();
        if (root == NULL) {
            return;
        }

        cJSON_AddNumberToObject(root, "temp",  (double)data.temp);
        cJSON_AddNumberToObject(root, "humi",  (double)data.humidity);
        cJSON_AddNumberToObject(root, "lamp",  (double)data.ldr);
        cJSON_AddNumberToObject(root, "soil",  (double)data.soil);
        cJSON_AddNumberToObject(root, "tank",  (double)data.tank);

        char *json_str = cJSON_PrintUnformatted(root);
        if (json_str == NULL) {
            cJSON_Delete(root);
            return;
        }

        // Use json_str BEFORE freeing it
        snprintf(payload, sizeof(payload), "42[\"sensor_data\", %s]", json_str);
                 
        esp_websocket_client_send_text(ws_client, payload, strlen(payload), portMAX_DELAY);
        ESP_LOGI(TAG, "Pushed telemetry: %s", payload);

        // NOW free the memory
        cJSON_free(json_str);
        cJSON_Delete(root);
    }
}

esp_err_t push_file_logs_raw(const char *filepath)
{
    if (ws_client == NULL || !esp_websocket_client_is_connected(ws_client)) {
        ESP_LOGW(TAG, "Client not connected");
        return ESP_ERR_INVALID_STATE;
    }

    FILE *f = fopen(filepath, "r"); // Open in text mode
    if (f == NULL) {
        ESP_LOGE(TAG, "Failed to open log file: %s", filepath);
        return ESP_ERR_NOT_FOUND;
    }

    // Allocate buffer (CHUNK_SIZE + 1 for null terminator)
    char *buffer = malloc(CHUNK_SIZE + 1);
    if (buffer == NULL) {
        fclose(f);
        return ESP_ERR_NO_MEM;
    }

    size_t n;
    ESP_LOGI(TAG, "Starting file transfer: %s", filepath);

    while ((n = fread(buffer, 1, CHUNK_SIZE, f)) > 0) {
        buffer[n] = '\0'; // Safely null-terminate the chunk

        // 1. Create a JSON object for the chunk
        cJSON *root = cJSON_CreateObject();
        cJSON_AddStringToObject(root, "filename", filepath);
        cJSON_AddStringToObject(root, "chunk", buffer);

        // 2. Print JSON to string
        char *json_str = cJSON_PrintUnformatted(root);
        if (json_str != NULL) {
            // 3. Format exactly how Socket.IO expects: 42["event_name", {data}]
            size_t payload_size = strlen(json_str) + 64; 
            char *payload = malloc(payload_size);
            if (payload) {
                snprintf(payload, payload_size, "42[\"log_chunk\", %s]", json_str);
                esp_websocket_client_send_text(ws_client, payload, strlen(payload), WS_SEND_TIMEOUT);
                free(payload);
            }
            cJSON_free(json_str);
        }
        cJSON_Delete(root);
        
        // Give the network stack a tiny moment to process and avoid flooding
        vTaskDelay(pdMS_TO_TICKS(20));
    }

    fclose(f);
    free(buffer);

    // Tell the server the file transfer is complete
    char fin_payload[256];
    snprintf(fin_payload, sizeof(fin_payload), "42[\"log_done\", {\"filename\": \"%s\"}]", filepath);
    esp_websocket_client_send_text(ws_client, fin_payload, strlen(fin_payload), WS_SEND_TIMEOUT);

    ESP_LOGI(TAG, "Finished transfer.");
    return ESP_OK;
}

esp_err_t handle_plant_set_info_ws(cJSON *root) {
    if (!root) {
        ESP_LOGE(TAG, "Failed to parse incoming JSON");
        return ESP_FAIL;
    }

    nvs_handle_t nvs_handle = open_nvs_handle();
    if (nvs_handle == 0) {
        ESP_LOGE(TAG, "Failed to open NVS");
        cJSON_Delete(root);
        return ESP_FAIL;
    }

    // Extract elements
    cJSON *h_soil_input   = cJSON_GetObjectItem(root, "h_soil");
    cJSON *l_soil_input   = cJSON_GetObjectItem(root, "l_soil");
    cJSON *h_temp_input   = cJSON_GetObjectItem(root, "h_temp");
    cJSON *l_temp_input   = cJSON_GetObjectItem(root, "l_temp");
    cJSON *h_humi_input   = cJSON_GetObjectItem(root, "h_humi");
    cJSON *l_humi_input   = cJSON_GetObjectItem(root, "l_humi");
    cJSON *interval_input = cJSON_GetObjectItem(root, "interval"); // in hours

    // Write to NVS
    if (cJSON_IsNumber(h_soil_input))   store_nvs_int(nvs_handle, "h_soil",   (int32_t)h_soil_input->valuedouble);
    if (cJSON_IsNumber(l_soil_input))   store_nvs_int(nvs_handle, "l_soil",   (int32_t)l_soil_input->valuedouble);
    if (cJSON_IsNumber(h_temp_input))   store_nvs_int(nvs_handle, "h_temp",   (int32_t)h_temp_input->valuedouble);
    if (cJSON_IsNumber(l_temp_input))   store_nvs_int(nvs_handle, "l_temp",   (int32_t)l_temp_input->valuedouble);
    if (cJSON_IsNumber(h_humi_input))   store_nvs_int(nvs_handle, "h_humi",   (int32_t)h_humi_input->valuedouble);
    if (cJSON_IsNumber(l_humi_input))   store_nvs_int(nvs_handle, "l_humi",   (int32_t)l_humi_input->valuedouble);
    if (cJSON_IsNumber(interval_input)) store_nvs_int(nvs_handle, "interval", (int32_t)interval_input->valuedouble);
    // interval in hours

    close_nvs(nvs_handle);

    ESP_LOGI(TAG, "Plant settings successfully updated via WebSocket");
    return ESP_OK;
}