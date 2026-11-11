#include "main_app.h"
#include <stdint.h>
#include "devices/buzzer.h"
#include "devices/lcd.h"
#include "esp_err.h"
#include "../wifi/ap.h"
#include "../wifi/driver.h"
#include "../sensors/ldr.h"
#include "../sensors/water_level.h"
#include "../sensors/adc.h"
#include "../sensors/soil_sensor.h"
#include "../sensors/dht11.h"
#include "../devices/led.h"
#include "../devices/lcd.h"
#include "../devices/water_pump.h"
#include <stdio.h>
#include "esp_log.h"
#include "freertos/task.h"
#include "fs/nvs_driver.h"
#include "nvs.h"
#include <sys/stat.h>

#define ADC_MAX          4095
#define SOIL_WET_DEFAULT 2048
#define TANK_FULL_DEFAULT 1930

static const char* TAG = "MAIN APP";

static inline float clamp_percent(float val) {
    if (val < 0.0f) return 0.0f;
    if (val > 100.0f) return 100.0f;
    return val;
}

esp_err_t start_setup_server(){    
    ESP_ERROR_CHECK(
        wifi_setup()
    );

    ESP_ERROR_CHECK(
        wifi_ap_setup()
    );
    return ESP_OK;
}

#define ADC_MAX          4095
#define SOIL_WET_DEFAULT 2048
#define TANK_FULL_DEFAULT 1930

static float raw_to_percent(int32_t raw, int32_t dry, int32_t wet)
{
    if (dry <= wet) return -1.0f;                 // bad calibration
    float p = (float)(dry - raw) * 100.0f / (float)(dry - wet);
    if (p < 0.0f)   p = 0.0f;
    if (p > 100.0f) p = 100.0f;
    return p;
}

Metrics_t get_metrics(void)
{
    Metrics_t metrics;
    int32_t soil_wet = SOIL_WET_DEFAULT;
    int32_t tank_full = TANK_FULL_DEFAULT;

    nvs_handle_t handle = open_nvs_handle();
    if (read_nvs_int(handle, &soil_wet, "soil") != ESP_OK)  soil_wet = SOIL_WET_DEFAULT;
    if (read_nvs_int(handle, &tank_full, "tank") != ESP_OK) tank_full = TANK_FULL_DEFAULT;
    close_nvs(handle);

    if (dht11_read(&metrics.temp, &metrics.humidity) != ESP_OK) {
        metrics.temp = metrics.humidity = -1;
    }

    if (ldr_read(&metrics.ldr) != ESP_OK) {
        metrics.ldr = -1;
    }

    if (soilsensor_read(&metrics.soil) != ESP_OK) {
        metrics.soil = -1;
        metrics.soil_percent = -1;
    } else {
        metrics.soil_percent = raw_to_percent(metrics.soil, ADC_MAX, soil_wet);
    }

    if (waterlevel_read(&metrics.tank) != ESP_OK) {
        metrics.tank = -1;
        metrics.tank_percent = -1;               // was soil_percent
    } else {
        metrics.tank_percent = raw_to_percent(metrics.tank, ADC_MAX, tank_full);
    }

    return metrics;
}

void get_current_time(char* buffer)
{
    time_t now;
    struct tm timeinfo;
    time(&now);
    localtime_r(&now, &timeinfo);

    strftime(buffer, 32, "%Y-%m-%d %H:%M:%S", &timeinfo);
}

void write_metrics_logs(void){
    Metrics_t metrics = get_metrics();

    const char *filepath = "/data/log_metrics.csv";

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
        fprintf(file, "time,soil moisture(%%),temperature(C),humidity(%%),lamp(LDR Raw 0-4095),tank(%%)\n");
    }
    
    char buf[64]; // for time
    get_current_time(buf);

    // Write formatted line: timestamp, string, integer, float with 2 decimals
    int chars_written = fprintf(file, "%s,%f,%f,%f,%d,%f\n", 
        buf
        , 100 - (((float)metrics.soil / 4095.0f) * 100.0f)
        , metrics.temp, metrics.humidity
        , metrics.ldr
        , ((float)metrics.tank / 4095.0f) * 100.0f
    );

    if(metrics.tank < 1228){
        led_yellow_on();
        play_alarm();
    }else{
        led_yellow_off();
    }

    if(metrics.soil >= 3000 && metrics.tank > 1228){
        start_watering(NULL);
    }

    if (chars_written < 0) {
        ESP_LOGE(TAG, "Error writing to file");
        fclose(file);
        return;
    }

    ESP_LOGI(TAG, "Log saved!");

    // Flush and close the file
    fclose(file);
}

void statues_updater(void *pvParameters){
    hd44780_t *lcd = (hd44780_t *)pvParameters;

    lcd_print_log(lcd, "Ready!");
    vTaskDelay(pdMS_TO_TICKS(5000));

    Metrics_t metrics = get_metrics();
    // lcd_print_wifi(lcd);
    lcd_print_value(lcd, "TEMP", metrics.temp, "C", (metrics.temp < 40));
    lcd_print_value(lcd, "HUMI", metrics.humidity, "%%", (metrics.humidity < 50));
    lcd_print_value(lcd, "LAMP", ((float)metrics.ldr / 4095.0f) * 100.0f, "%%", (metrics.ldr < 2048));
    lcd_print_value(lcd, "SOIL", 100 - (((float)metrics.soil / 4095.0f) * 100.0f), "%%", (metrics.soil < 2048));
    lcd_print_value(lcd, "TANK", ((float)metrics.tank / 4095.0f) * 100.0f, "%%", (metrics.tank > 2048));

    vTaskDelay(pdMS_TO_TICKS(5000));
    int interval = 1;
    nvs_handle_t handle = open_nvs_handle();
    read_nvs_int(handle, &interval, "interval");
    while (1) {
        write_metrics_logs();
        vTaskDelay(pdMS_TO_TICKS(interval * 3600 * 1000)); // (DONE) get interval value from NVS
    }
}

esp_err_t start_app(){
    relay_init();
    // start_watering();

    hd44780_t *lcd = lcd_drv_init(); // dead code
    init_buzzer();
    play_startup();
    
    lcd_print_log(lcd, "Starting");

    if(lcd == NULL){
        ESP_LOGE(TAG, "LCD Welcome failed");
    }

    lcd_print_log(lcd, "webserver start");

    led_config();
    lcd_print_log(lcd, "LED Config");

    adc_manager_init();
    lcd_print_log(lcd, "sensors init");

    
    xTaskCreate( statues_updater,
        "Sensor Thread Read",
        2048,
        (void *)lcd,
        3,
        NULL );

    return ESP_OK;
}