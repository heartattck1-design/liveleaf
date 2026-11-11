idf_component_register(SRCS "main.c" 
                                "wifi/driver.c" "wifi/ap.c" "wifi/sta.c" 
                                "wifi/ntp.c"

                                "fs/fatfs_driver.c" "fs/nvs_driver.c"

                                "app/main_app.c"

                                "webserver/app.c" "webserver/controller.c"
                                "webserver/ws.c"

                                "sensors/ldr.c" "sensors/water_level.c"
                                "sensors/soil_sensor.c" "sensors/adc.c"
                                "sensors/dht11.c"
                                
                                "devices/led.c" "devices/lcd.c"
                                "devices/buzzer.c" "devices/water_pump.c"
                    INCLUDE_DIRS "."
                    REQUIRES 
                        cjson 
                        fatfs 
                        esp_wifi 
                        nvs_flash
                        dns_server
                        esp_http_server
                        esp_driver_gpio
                        driver
                        esp_adc
                        freertos
                        mdns
                        # hd44780
                        esp_driver_ledc
                        espressif__esp_websocket_client
                        )

# fatfs_create_spiflash_image(storage "storage" FLASH_IN_PROJECT PRESERVE_TIME)
fatfs_create_rawflash_image(data_r "storage" FLASH_IN_PROJECT)

# if(CONFIG_FATFS_MODE_READ_ONLY)
# fatfs_create_rawflash_image(storage ${image} "./storage" PRESERVE_TIME)
# else()
# fatfs_create_spiflash_image(storage ${image} FLASH_IN_PROJECT PRESERVE_TIME)
# endif()