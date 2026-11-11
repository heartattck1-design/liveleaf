// This code for dealing with LDR Sensor (Light Level Sensor)
// Sensor is connected to GPIO 34 , ADC1 input-only
// This code for one shot read the analog data 

#include "ldr.h"
#include "esp_check.h"
#include "adc.h"

// global
static const char* TAG = "LDR";

esp_err_t ldr_read(int* target){
    if (target == NULL || adc1_handle == NULL) {
        return ESP_ERR_INVALID_ARG;
    }
    ESP_RETURN_ON_ERROR(
        adc_oneshot_read(adc1_handle, ADC_CHANNEL_6, target),
        TAG, "Failed to read LDR Raw value"
    );

    return ESP_OK;
}

static void ldr_read_loop_thread(void *pvParameters){
    int raw_data = 0;
    while (1) {
        if(ldr_read(&raw_data) != ESP_OK){
            ESP_LOGE(TAG, "failed to read data");
        }else{
            ESP_LOGI(TAG, "LDR Sensor data: %d", raw_data);
        }
        vTaskDelay(pdMS_TO_TICKS(5000));
    }
}

void ldr_start_thread(){
    return;
//     xTaskCreate( ldr_read_loop_thread,
//                  "LDR Thread Read",
//                  2048,
//                  NULL,
//                  3,
//                  NULL );
}