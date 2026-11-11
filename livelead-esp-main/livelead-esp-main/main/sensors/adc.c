// ADC1 Manager
#include "adc.h"
#include "esp_check.h"

static const char* TAG = "ADC_MANAGER";
adc_oneshot_unit_handle_t adc1_handle = NULL;

esp_err_t adc_manager_init(void)
{
    // 1. Initialize ADC1 Unit ONLY ONCE
    adc_oneshot_unit_init_cfg_t init_config = {
        .unit_id = ADC_UNIT_1,
        .ulp_mode = ADC_ULP_MODE_DISABLE,
    };
    ESP_RETURN_ON_ERROR(
        adc_oneshot_new_unit(&init_config, &adc1_handle),
        TAG, "Failed to initialize ADC1 Unit"
    );

    // 2. Common channel configuration (12-bit, ~3.1V max range)
    adc_oneshot_chan_cfg_t chan_config = {
        .bitwidth = ADC_BITWIDTH_DEFAULT,
        .atten = ADC_ATTEN_DB_12,
    };

    // Configure Channel 6 (GPIO 34 - LDR)
    ESP_RETURN_ON_ERROR(
        adc_oneshot_config_channel(adc1_handle, ADC_CHANNEL_6, &chan_config),
        TAG, "Failed to configure ADC1 CH6 (LDR)"
    );

    // Configure Channel 7 (GPIO 35 - Water Level)
    ESP_RETURN_ON_ERROR(
        adc_oneshot_config_channel(adc1_handle, ADC_CHANNEL_7, &chan_config),
        TAG, "Failed to configure ADC1 CH7 (Water Level)"
    );

    // Configure Channel 4 (GPIO 32 - Soil Moisture)
    ESP_RETURN_ON_ERROR(
        adc_oneshot_config_channel(adc1_handle, ADC_CHANNEL_4, &chan_config),
        TAG, "Failed to configure ADC1 CH4 (Soil Moisture)"
    );

    return ESP_OK;
}