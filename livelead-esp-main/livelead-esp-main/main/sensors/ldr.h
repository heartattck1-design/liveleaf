#ifndef LDR_SENSOR_H
#define LDR_SENSOR_H

#include "esp_check.h"
#include "esp_err.h"
#include "esp_adc/adc_oneshot.h"
#include "esp_err.h"

#include <stdio.h>
#include <stdlib.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

esp_err_t ldr_init(void);
esp_err_t ldr_read(int* target);
void ldr_start_thread(void);

#endif