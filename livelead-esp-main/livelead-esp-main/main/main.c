#include <stdio.h>
#include <stdlib.h>

#include "esp_err.h"

#include "fs/fatfs_driver.h"
#include "fs/nvs_driver.h"

#include "app/main_app.h"
#include "nvs.h"

#include "devices/lcd.h"
#include "devices/buzzer.h"

#include "./app/main_app.h"
#include "./wifi/sta.h"
#include "./webserver/app.h"
#include "./wifi/ntp.h"

void app_main(void)
{
    // mount FATFS
    ESP_ERROR_CHECK(
        storage_setup()
    );

    // init NVS
    ESP_ERROR_CHECK(
        nvs_init()
    );

    // start handler
    nvs_handle_t handle = open_nvs_handle();
    if(handle == 0){
        abort();
    }

    int32_t is_wifi_setup;
    if(read_nvs_int(handle, &is_wifi_setup, "wifi_setup") != ESP_OK){
        is_wifi_setup = 0;
    }
    
    
    
    if(!is_wifi_setup){
        start_setup_server();
    }else{
        wifi_sta_connect(&handle);
        start_app();
    }
    start_mdns();
    
    webserver_register();

    print_time();

    close_nvs(handle);
}
