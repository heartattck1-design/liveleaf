// Water Level Sensor, Analog Sensor for the water height
// ADC1 GPIO 32 - CH 4
#include "soil_sensor.h"

#include "esp_check.h"
#include "esp_check.h"
#include "esp_err.h"
#include "esp_adc/adc_oneshot.h"
#include "esp_err.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#include "adc.h"

// global
static const char* TAG = "SOIL_SENSOR";

esp_err_t soilsensor_read(int* target){
    if (target == NULL || adc1_handle == NULL) {
        return ESP_ERR_INVALID_ARG;
    }

    ESP_RETURN_ON_ERROR(
        adc_oneshot_read(adc1_handle, ADC_CHANNEL_4, target),
        TAG, "Failed to read Soil Sensor Raw value"
    );

    return ESP_OK;
}

// static void soilsensor_read_loop_thread(void *pvParameters){
//     // int raw_data = 0;
//     // while (1) {
//     //     if(soilsensor_read(&raw_data) != ESP_OK){
//     //         ESP_LOGE(TAG, "failed to Soil Sensor read data");
//     //     }else{
//     //         ESP_LOGI(TAG, "Soil Sensor data: %d", raw_data);
//     //     }
//     //     vTaskDelay(pdMS_TO_TICKS(5000));
//     // }
// }

void soilsensor_start_thread(){
    return;
    // xTaskCreate( soilsensor_read_loop_thread,
    //              "Soil Sensor Thread Read",
    //              2048,
    //              NULL,
    //              3,
    //              NULL );
}