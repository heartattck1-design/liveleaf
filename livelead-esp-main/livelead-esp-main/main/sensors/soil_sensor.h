#ifndef SOIL_SENSOR_H
#define SOIL_SENSOR_H

#include "esp_err.h"

esp_err_t soilsensor_init(void);
esp_err_t soilsensor_read(int* target);
void soilsensor_start_thread(void);

#endif