#include "dht.h"
#include "esp_check.h"
#include "esp_err.h"
#include <stdio.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include "esp_log.h"
#include "dht11.h"

#define DHT_GPIO GPIO_NUM_4  // GPIO number for DHT sensor
#define DHT_TYPE DHT_TYPE_DHT11  // Type of DHT sensor

static const char* TAG = "DHT11";

esp_err_t dht11_read(float* temperature, float* humidity){
    // Read temperature and humidity
    ESP_RETURN_ON_ERROR(
        dht_read_float_data(DHT_TYPE, DHT_GPIO,humidity, temperature)
    , TAG, "failed to read DHT11 DATA");

    return ESP_OK;
}

static void dht11_read_loop_thread(void *pvParameters){
    float temperature = 0.0f, humidity = 0.0f;
    vTaskDelay(pdMS_TO_TICKS(2000));
    
    while (1) {
        if(dht11_read(&temperature, &humidity) != ESP_OK){
            ESP_LOGE(TAG, "failed to Soil Sensor read data");
        }else{
            ESP_LOGI(TAG, "Temperature: %.1f°C, Humidity: %.1f%%\n", temperature, humidity);
        }
        vTaskDelay(pdMS_TO_TICKS(5000));
    }
}

void dht11_start_thread(void){
    return;
    // xTaskCreate( dht11_read_loop_thread,
    //              "DHT11 Sensor Thread Read",
    //              2048,
    //              NULL,
    //              3,
    //              NULL );
}