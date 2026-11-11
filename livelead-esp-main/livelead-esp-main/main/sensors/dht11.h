#pragma once

#include "esp_err.h"
#include <driver/gpio.h>

// int dht11_drv_init(void);
esp_err_t dht11_read(float* temperature, float* humidity);
void dht11_start_thread(void);
