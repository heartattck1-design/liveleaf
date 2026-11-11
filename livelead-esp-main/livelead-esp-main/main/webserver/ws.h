#ifndef WS_CONTROLLER_H
#define WS_CONTROLLER_H

#include "esp_err.h"
#include "cJSON.h"

static void send_device_response(const char *req_id, const char *status, cJSON *extra_data);
esp_err_t handle_plant_set_info_ws(cJSON *root);
esp_err_t push_file_logs_raw(const char *filepath);
void push_sensor_data(void);
void app_websocket_start(void);

#endif