#ifndef APP_H
#define APP_H

#include "esp_err.h"
#include "nvs_flash.h"

#ifndef NULL
#define NULL ((void *)0)
#endif

typedef struct {
    int tank;
    float tank_percent;
    int soil;
    float soil_percent;
    int ldr;
    float temp;
    float humidity;
} Metrics_t;

// extern Metrics_t* metrics;

esp_err_t start_setup_server();
esp_err_t start_app();
Metrics_t get_metrics();
void get_current_time(char* buffer);

#endif