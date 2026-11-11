// Water Level Sensor, Analog Sensor for the water height
// ADC1 GPIO 35 - CH 7
#include "water_level.h"

#include "devices/led.h"
#include "esp_check.h"
#include "esp_check.h"
#include "esp_err.h"
#include "esp_adc/adc_oneshot.h"
#include "esp_err.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "../devices/led.h"

#include "adc.h"

// global
static const char* TAG = "WATER_LEVEL";

esp_err_t waterlevel_read(int* target){
    if (target == NULL || adc1_handle == NULL) {
        return ESP_ERR_INVALID_ARG;
    }

    ESP_RETURN_ON_ERROR(
        adc_oneshot_read(adc1_handle, ADC_CHANNEL_7, target),
        TAG, "Failed to read Water Level Raw value"
    );

    return ESP_OK;
}

// static void waterlevel_read_loop_thread(void *pvParameters){
//     int raw_data = 0;
//     bool alert = false;
//     while (1) {
//         if(waterlevel_read(&raw_data) != ESP_OK){
//             ESP_LOGE(TAG, "failed to read data");
//         }else{
//             ESP_LOGI(TAG, "Water Level Sensor data: %d", raw_data);
//         }

//         if(raw_data <= 1500){
//             led_yellow_toggle();
//             alert = true;
//             // printf("YELLOW ON");
//         }
//         if(raw_data > 1500){
//             if(alert){
//                 led_yellow_toggle();
//                 alert = false;
//             }
//         }

//         vTaskDelay(pdMS_TO_TICKS(5000));
//     }
// }

void waterlevel_start_thread(){
    return;
    // xTaskCreate( waterlevel_read_loop_thread,
    //              "Water Level Thread Read",
    //              2048,
    //              NULL,
    //              3,
    //              NULL );
}