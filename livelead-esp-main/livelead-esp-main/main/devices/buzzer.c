#include "driver/gpio.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "buzzer.h"

#define BUZZER_PIN GPIO_NUM_13

void init_buzzer(void) {
    gpio_reset_pin(BUZZER_PIN);
    gpio_set_direction(BUZZER_PIN, GPIO_MODE_OUTPUT);
}

void play_startup(void){
    gpio_set_level(BUZZER_PIN, 1); // Turn buzzer ON
    vTaskDelay(pdMS_TO_TICKS(500));
    gpio_set_level(BUZZER_PIN, 0); // Turn buzzer OFF
    vTaskDelay(pdMS_TO_TICKS(500));
    gpio_set_level(BUZZER_PIN, 1); // Turn buzzer ON
    vTaskDelay(pdMS_TO_TICKS(500));
    gpio_set_level(BUZZER_PIN, 0); // Turn buzzer OFF
}

void play_alarm(void){
    gpio_set_level(BUZZER_PIN, 1); // Turn buzzer ON
    vTaskDelay(pdMS_TO_TICKS(1000));
    gpio_set_level(BUZZER_PIN, 0); // Turn buzzer OFF
    vTaskDelay(pdMS_TO_TICKS(1000));
    gpio_set_level(BUZZER_PIN, 1); // Turn buzzer ON
    vTaskDelay(pdMS_TO_TICKS(1000));
    gpio_set_level(BUZZER_PIN, 0); // Turn buzzer OFF
}