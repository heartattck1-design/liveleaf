#ifndef WIFI_STA_H
#define WIFI_STA_H

#include "driver.h"
#include "esp_wifi.h"
#include "../fs/nvs_driver.h"

#include "esp_err.h"
#include "esp_event.h"
#include "esp_log.h"

esp_err_t wifi_sta_connect(nvs_handle_t *handle);
void start_mdns(void);

#endif