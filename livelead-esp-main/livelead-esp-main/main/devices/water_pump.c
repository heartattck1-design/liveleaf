#include "driver/gpio.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "led.h"
#include <stdio.h>
#include "esp_log.h"
#include "../app/main_app.h"
#include <sys/stat.h>

#define RELAY_GPIO_PIN  GPIO_NUM_26
#define RELAY_ON        1   // active low, same as the Arduino code
#define RELAY_OFF       0

static const char* TAG = "WATER_PUMP";
void relay_init(void)
{
    gpio_reset_pin(RELAY_GPIO_PIN);
    gpio_set_level(RELAY_GPIO_PIN, RELAY_OFF);              // preload OFF before enabling output
    gpio_set_direction(RELAY_GPIO_PIN, GPIO_MODE_OUTPUT);   // push-pull, like pinMode(OUTPUT)
}

void write_watering_log(int* ptr_delay)
{
    const char *filepath = "/data/log_watering.csv";

    float delay;
    if(ptr_delay == NULL){
        delay = 3.0f;
    }else{
        delay = (float)*ptr_delay / 1000.0f;
    }

    float amount = 0.6f * ((float)delay);

    struct stat st;
    bool needs_header = false;

    // stat() returns -1 if the file doesn't exist
    // st.st_size == 0 means the file exists but has 0 bytes (empty)
    if (stat(filepath, &st) != 0 || st.st_size == 0) {
        needs_header = true;
    }

    // Open file in append mode ("a") to add lines without overwriting
    // Use "w" mode if you want to overwrite/create a fresh file every time
    FILE *file = fopen(filepath, "a");
    if (file == NULL) {
        ESP_LOGE(TAG, "Error opening file");
        return;
    }

    if(needs_header){
        fprintf(file, "time,delay(Seconds),amount(L)\n");
    }

    char buf[32]; // for time
    get_current_time(buf);

    // Write formatted line: timestamp, string, integer, float with 2 decimals
    int chars_written = fprintf(file, "%s,%f,%f\n", 
        buf, delay, amount
    );

    if (chars_written < 0) {
        ESP_LOGE(TAG, "Error writing to file");
        fclose(file);
        return;
    }

    ESP_LOGI(TAG, "Log saved!");
    // Flush and close the file
    fclose(file);
}

void start_watering(void *pvParameters)
{
    led_red_toggle();

    gpio_set_level(RELAY_GPIO_PIN, RELAY_ON);
    printf("RELAY ON!\n");

    if(pvParameters == NULL){
        vTaskDelay(pdMS_TO_TICKS(3000));
    }else{
        vTaskDelay(pdMS_TO_TICKS(*(int* )pvParameters));
    }
    
    gpio_set_level(RELAY_GPIO_PIN, RELAY_OFF);
    printf("RELAY OFF!\n");
    
    led_red_toggle();

    write_watering_log((int* )pvParameters);

    if (pvParameters) vTaskDelete(NULL);
}