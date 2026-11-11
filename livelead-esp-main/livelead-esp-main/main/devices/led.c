/*  
  Rui Santos & Sara Santos - Random Nerd Tutorials
  https://RandomNerdTutorials.com/esp-idf-esp32-blink-led/
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "sdkconfig.h"
#include "led.h"

// Define the GPIO pin for the LED (GPIO 2 is common for onboard LEDs)
#define BLINK_GPIO 2
#define YELLOW_LED 27
#define RED_LED 14

static bool red_led = false;
// static bool yellow_led = false;

void led_config(void){
    // Configure the GPIO pin
    gpio_reset_pin(BLINK_GPIO);
    gpio_reset_pin(YELLOW_LED);
    gpio_reset_pin(RED_LED);

    gpio_set_direction(BLINK_GPIO, GPIO_MODE_OUTPUT);
    gpio_set_direction(RED_LED, GPIO_MODE_OUTPUT);
    gpio_set_direction(YELLOW_LED, GPIO_MODE_OUTPUT);
}

void led_red_toggle(void){
    if(red_led){
        gpio_set_level(RED_LED, 0);
    }else{
        gpio_set_level(RED_LED, 1);
    }

    red_led = !red_led;
}

void led_yellow_off(void){
    gpio_set_level(YELLOW_LED, 0);
}

void led_yellow_on(void){
    gpio_set_level(YELLOW_LED, 1);
}

