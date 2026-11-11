#ifndef WATER_LEVEL_H
#define WATER_LEVEL_H

#include "esp_err.h"

esp_err_t waterlevel_init(void);
esp_err_t waterlevel_read(int* target);
void waterlevel_start_thread(void);

#endif