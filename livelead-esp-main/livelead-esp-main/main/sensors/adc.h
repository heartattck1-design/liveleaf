#pragma once

#include "esp_err.h"
#include "esp_adc/adc_oneshot.h"

#ifndef NULL
#define NULL ((void *)0)
#endif

// Expose the shared handle so other sensor files can use it
extern adc_oneshot_unit_handle_t adc1_handle;

// Call this function once during system boot
esp_err_t adc_manager_init(void);