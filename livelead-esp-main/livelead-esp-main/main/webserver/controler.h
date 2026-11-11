#ifndef SERVER_CONTROLLER_H
#define SERVER_CONTROLLER_H

#include "esp_err.h"
#include "esp_http_server.h"

esp_err_t starting_page_handle(httpd_req_t *req);
esp_err_t setup_wifi_handle(httpd_req_t *req);
esp_err_t setup_cloud_credentials(httpd_req_t *req);
esp_err_t read_endpoint_handle(httpd_req_t *req);

esp_err_t set_soil_calibration_handle(httpd_req_t *req);
esp_err_t set_tank_calibration_handle(httpd_req_t *req);

esp_err_t send_metrics_logs_handle(httpd_req_t *req);
esp_err_t send_watering_logs_handle(httpd_req_t *req);

esp_err_t start_watering_handle(httpd_req_t *req);
esp_err_t plant_set_info_handle(httpd_req_t *req);

#endif