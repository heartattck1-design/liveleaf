#include "app/main_app.h"
#include "controler.h"
#include "esp_check.h"
#include "esp_err.h"
#include "esp_http_server.h"
#include "app.h"
#include "cJSON.h"
#include "esp_log.h"
#include "fs/nvs_driver.h"
#include "lwip/api.h"
#include "nvs.h"
#include "../sensors/dht11.h"
#include "../sensors/ldr.h"
#include "../sensors/soil_sensor.h"
#include "../sensors/water_level.h"
#include "esp_wifi.h"
#include <stdint.h>
#include "../devices/water_pump.h"

static const char* TAG = "Web_Controller";

esp_err_t starting_page_handle(httpd_req_t *req)
{
    FILE *file = NULL;

    wifi_mode_t mode;
    if (esp_wifi_get_mode(&mode) == ESP_OK) {
        switch (mode) {
            case WIFI_MODE_STA:
                file = fopen("/static/dashboard.html", "r");
                break;
            default:
                file = fopen("/static/setup.html", "r");
                break;
        }
    }

    if (file == NULL) {
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to open HTML file");
        return ESP_FAIL;
    }

    httpd_resp_set_type(req, "text/html");

    send_req_data(file, req);

    httpd_resp_send_chunk(req, NULL, 0);

    return ESP_OK;
}


esp_err_t setup_wifi_handle(httpd_req_t *req){
    char* buf =  malloc(req->content_len + 1); // + 1 for null terminator
    if(!buf){
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to allocate memory to receive the request");
        return ESP_FAIL;
    }
    
    if(recv_req_data(req, buf) != ESP_OK){
        free(buf);
        buf = NULL;
        ESP_LOGE(TAG, "Recieving request failed!");
        return ESP_FAIL;
    }

    // Parse JSON
    cJSON *root = cJSON_Parse(buf);
    if (!root) {
        httpd_resp_send_500(req);
        free(buf);
        buf = NULL;
        return ESP_FAIL;
    }

    cJSON *ssid_input = cJSON_GetObjectItem(root, "ssid");
    cJSON *pwd_input = cJSON_GetObjectItem(root, "pwd");
    
    nvs_handle_t nvs_handle = open_nvs_handle();
    if(nvs_handle == 0){
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to open nvs");
        goto cleanup;
        return ESP_FAIL;
    }

    if (cJSON_IsString(ssid_input) && cJSON_IsString(pwd_input)) {
        store_nvs_str(nvs_handle, "ssid", ssid_input->valuestring);
        store_nvs_str(nvs_handle,  "pwd", pwd_input->valuestring);
        store_nvs_int(nvs_handle, "wifi_setup", 1);
        commit_nvs(nvs_handle);
    }else{
        httpd_resp_send_err(req, HTTPD_400_BAD_REQUEST, "Missing SSID or password");
        goto cleanup;
        return ESP_FAIL;
    }

    goto cleanup;

    cleanup:
        // free allocated memory
        if(nvs_handle) close_nvs(nvs_handle);
        nvs_handle = 0;
        if(root) cJSON_Delete(root);
        root = NULL;
        if(buf) free(buf);
        buf = NULL;

    // Send response
    const char *resp = "OK";
    httpd_resp_set_type(req, "text/plain");
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t setup_cloud_credentials(httpd_req_t *req){
    char* buf =  malloc(req->content_len + 1); // + 1 for null terminator
    if(!buf){
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to allocate memory to receive the request");
        return ESP_FAIL;
    }
    
    if(recv_req_data(req, buf) != ESP_OK){
        free(buf);
        buf = NULL;
        ESP_LOGE(TAG, "Recieving request failed!");
        return ESP_FAIL;
    }

    // Parse JSON
    cJSON *root = cJSON_Parse(buf);
    if (!root) {
        httpd_resp_send_500(req);
        free(buf);
        buf = NULL;
        return ESP_FAIL;
    }

    cJSON *ssid_input = cJSON_GetObjectItem(root, "token");
    cJSON *pwd_input = cJSON_GetObjectItem(root, "url");
    
    nvs_handle_t nvs_handle = open_nvs_handle();
    if(nvs_handle == 0){
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to open nvs");
        goto cleanup;
        return ESP_FAIL;
    }

    if (cJSON_IsString(ssid_input) && cJSON_IsString(pwd_input)) {
        store_nvs_str(nvs_handle, "token", ssid_input->valuestring);
        store_nvs_str(nvs_handle,  "ip", pwd_input->valuestring);
        commit_nvs(nvs_handle);
    }else{
        httpd_resp_send_err(req, HTTPD_400_BAD_REQUEST, "Missing SSID or password");
        goto cleanup;
        return ESP_FAIL;
    }

    goto cleanup;

    cleanup:
        // free allocated memory
        if(nvs_handle) close_nvs(nvs_handle);
        nvs_handle = 0;
        if(root) {
            cJSON_Delete(root);
            root = NULL;
        }
        if(buf) free(buf);
        buf = NULL;

    // Send response
    const char *resp = "OK";
    httpd_resp_set_type(req, "text/plain");
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t read_endpoint_handle(httpd_req_t *req)
{
    Metrics_t metrics = get_metrics();

    cJSON *root = cJSON_CreateObject();
    if (root == NULL) {
        return httpd_resp_send_500(req);
    }

    cJSON_AddNumberToObject(root, "temp", metrics.temp);
    cJSON_AddNumberToObject(root, "humi", metrics.humidity);
    cJSON_AddNumberToObject(root, "lamp", metrics.ldr);
    cJSON_AddNumberToObject(root, "soil", metrics.soil_percent);
    cJSON_AddNumberToObject(root, "tank", metrics.tank_percent);

    char *json_str = cJSON_PrintUnformatted(root);
    if (json_str == NULL) {
        cJSON_Delete(root);
        return httpd_resp_send_500(req);
    }

    // all headers must be set BEFORE httpd_resp_send()
    httpd_resp_set_type(req, "application/json");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Cache-Control", "no-store");

    esp_err_t err = httpd_resp_send(req, json_str, HTTPD_RESP_USE_STRLEN);

    cJSON_free(json_str);
    cJSON_Delete(root);
    return err;
}

esp_err_t set_soil_calibration_handle(httpd_req_t *req)
{
    int soil_raw;
    if (soilsensor_read(&soil_raw) != ESP_OK){
        httpd_resp_send_err(req, 500, "calibrate again");
        return ESP_FAIL;
    }

    nvs_handle handle = open_nvs_handle();
    store_nvs_int(handle, "soil", (int32_t)soil_raw);
    commit_nvs(handle);
    close_nvs(handle);    

    // Send response
    const char *resp = "OK";
    httpd_resp_set_type(req, "text/plain");
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t set_tank_calibration_handle(httpd_req_t *req)
{
    int tank_raw;
    if (waterlevel_read(&tank_raw) != ESP_OK){
        httpd_resp_send_err(req, 500, "calibrate again");
        return ESP_FAIL;
    }

    nvs_handle handle = open_nvs_handle();
    store_nvs_int(handle, "tank", (int32_t)tank_raw);
    commit_nvs(handle);
    close_nvs(handle);    

    // Send response
    const char *resp = "OK";
    httpd_resp_set_type(req, "text/plain");
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t start_watering_handle(httpd_req_t *req)
{

    char* buf =  malloc(req->content_len + 1); // + 1 for null terminator
    if(!buf){
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to allocate memory to receive the request");
        return ESP_FAIL;
    }
    
    if(recv_req_data(req, buf) != ESP_OK){
        free(buf);
        buf = NULL;
        ESP_LOGE(TAG, "Recieving request failed!");
        return ESP_FAIL;
    }

    // Parse JSON
    cJSON *root = cJSON_Parse(buf);
    if (!root) {
        httpd_resp_send_500(req);
        free(buf);
        buf = NULL;
        return ESP_FAIL;
    }

    cJSON *duration_input = cJSON_GetObjectItem(root, "duration");
    int duration;
    if (cJSON_IsNumber(duration_input)) {
        duration = (int)duration_input->valuedouble * 1000;
    }else{
        httpd_resp_send_err(req, HTTPD_400_BAD_REQUEST, "Missing duration");
        goto cleanup;
        return ESP_FAIL;
    }

    cleanup:
        free(buf);
        cJSON_Delete(root);
        cJSON_free(root);

    start_watering(&duration);

    // Send response
    const char *resp = "OK";
    httpd_resp_set_type(req, "text/plain");
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t send_metrics_logs_handle(httpd_req_t *req)
{
    FILE *file = fopen("/data/log_metrics.csv", "r");

    if (file == NULL) {
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to open HTML file");
        return ESP_FAIL;
    }

    httpd_resp_set_type(req, "text/csv");
    send_req_data(file, req);
    httpd_resp_send_chunk(req, NULL, 0);

    return ESP_OK;
}

esp_err_t send_watering_logs_handle(httpd_req_t *req)
{
    FILE *file = fopen("/data/log_watering.csv", "r");

    if (file == NULL) {
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to open HTML file");
        return ESP_FAIL;
    }

    httpd_resp_set_type(req, "text/csv");
    send_req_data(file, req);
    httpd_resp_send_chunk(req, NULL, 0);
    
    return ESP_OK;
}

esp_err_t plant_set_info_handle(httpd_req_t *req){
    char *buf = NULL;
    cJSON *root = NULL;
    nvs_handle_t nvs_handle = 0;

    buf =  malloc(req->content_len + 1); // + 1 for null terminator
    if(!buf){
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to allocate memory to receive the request");
        return ESP_FAIL;
    }
    
    if(recv_req_data(req, buf) != ESP_OK){
        ESP_LOGE(TAG, "Recieving request failed!");
        goto cleanup;
        return ESP_FAIL;
    }

    // Parse JSON
    root = cJSON_Parse(buf);
    if (!root) {
        httpd_resp_send_500(req);
        goto cleanup;
        return ESP_FAIL;
    }

    // 1. Extract JSON elements
    cJSON *h_soil_input   = cJSON_GetObjectItem(root, "h_soil");
    cJSON *l_soil_input   = cJSON_GetObjectItem(root, "l_soil");
    cJSON *h_temp_input   = cJSON_GetObjectItem(root, "h_temp");
    cJSON *l_temp_input   = cJSON_GetObjectItem(root, "l_temp");
    cJSON *h_humi_input   = cJSON_GetObjectItem(root, "h_humi");
    cJSON *l_humi_input   = cJSON_GetObjectItem(root, "l_humi");
    cJSON *interval_input = cJSON_GetObjectItem(root, "interval");

    // 2. Open NVS handle
    nvs_handle = open_nvs_handle();
    if (nvs_handle == 0) {
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to open NVS");
        goto cleanup; // Ensure cleanup performs cJSON_Delete(root) if allocated
    }

    // 3. Store threshold and telemetry settings (numeric types)
    if (cJSON_IsNumber(h_soil_input)) {
        store_nvs_int(nvs_handle, "h_soil", (int32_t)h_soil_input->valuedouble);
    }
    if (cJSON_IsNumber(l_soil_input)) {
        store_nvs_int(nvs_handle, "l_soil", (int32_t)l_soil_input->valuedouble);
    }

    if (cJSON_IsNumber(h_temp_input)) {
        store_nvs_int(nvs_handle, "h_temp", (int32_t)h_temp_input->valuedouble);
    }

    if (cJSON_IsNumber(l_temp_input)) {
        store_nvs_int(nvs_handle, "l_temp", (int32_t)l_temp_input->valuedouble);
    }

    if (cJSON_IsNumber(h_humi_input)) {
        store_nvs_int(nvs_handle, "h_humi", (int32_t)h_humi_input->valuedouble);
    }
    if (cJSON_IsNumber(l_humi_input)) {
        store_nvs_int(nvs_handle, "l_humi", (int32_t)l_humi_input->valuedouble);
    }

    if (cJSON_IsNumber(interval_input)) {
        store_nvs_int(nvs_handle, "interval", (uint32_t)interval_input->valuedouble);
    }

    goto cleanup;

    cleanup:
        // free allocated memory
        if(nvs_handle) close_nvs(nvs_handle);
        nvs_handle = 0;
        if(root) {
            cJSON_Delete(root);
            root = NULL;
        }
        if(buf) free(buf);
        buf = NULL;

    // Send response
    const char *resp = "OK";
    httpd_resp_set_type(req, "text/plain");
    httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}