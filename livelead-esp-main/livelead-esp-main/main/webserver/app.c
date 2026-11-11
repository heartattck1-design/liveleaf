#include "app.h"
#include "routes.h"

#include <esp_err.h>
#include "esp_http_server.h"
#include "esp_log.h"

static const char* TAG = "Server App"; 

httpd_handle_t start_webserver() {
    httpd_handle_t server = NULL;
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();
    config.max_uri_handlers = 10;

    if (httpd_start(&server, &config) == ESP_OK) {
        ESP_LOGI(TAG, "Server started successfully, registering URI handlers...");
        return server;
    }

    ESP_LOGE(TAG, "Failed to start server");
    return NULL;
}

void send_req_data(FILE* file, httpd_req_t* req)
{
    size_t chunksize;
    char chunk[256];
    do {
        chunksize = fread(chunk, 1, sizeof(char) * 256, file);
        if (chunksize > 0) {
            if (httpd_resp_send_chunk(req, chunk, chunksize) != ESP_OK) {
                fclose(file);
                return;
            }
        }
    } while (chunksize != 0);
    fclose(file);
}

esp_err_t recv_req_data(httpd_req_t* req, char* buffer){
    if (req->content_len == 0 || req->content_len > MAX_PAYLOAD_SIZE) {
        httpd_resp_send_err(req, HTTPD_400_BAD_REQUEST, "Invalid size");
        return ESP_FAIL;
    }

    int total_len = req->content_len;
    int cur_len = 0;
    int received = 0;

    // Read the incoming request body data into the buffer
    while (cur_len < total_len) {
        received = httpd_req_recv(req, buffer + cur_len, total_len - cur_len);
        if (received <= 0) {
            if (received == HTTPD_SOCK_ERR_TIMEOUT) {
                continue; // Retry on timeout
            }
            return ESP_FAIL;
        }
        cur_len += received;
    }

    buffer[total_len] = '\0'; // Null-terminate the string

    return ESP_OK;
}

esp_err_t webserver_register()
{
    httpd_handle_t http_server = start_webserver();

    httpd_register_uri_handler(http_server,&starting_page_uri);

    httpd_register_uri_handler(http_server,&setup_wifi_uri);
    httpd_register_uri_handler(http_server,&setup_cloud_uri);

    httpd_register_uri_handler(http_server,&read_endpoint_uri);

    httpd_register_uri_handler(http_server,&set_soil_calibration_uri);
    httpd_register_uri_handler(http_server,&set_tank_calibration_uri);
    
    httpd_register_uri_handler(http_server,&send_metrics_logs_uri);
    httpd_register_uri_handler(http_server,&send_watering_logs_uri);

    httpd_register_uri_handler(http_server,&start_watering_uri);
    httpd_register_uri_handler(http_server,&plant_set_info_uri);


    return ESP_OK;
}