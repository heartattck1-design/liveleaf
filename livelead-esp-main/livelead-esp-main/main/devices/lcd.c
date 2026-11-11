#include "lcd.h"

#include "esp_err.h"
#include "esp_netif_ip_addr.h"
#include "esp_wifi.h"
#include "esp_wifi_types_generic.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
// #include "hd44780.h"
#include "../app/main_app.h"
#include <stdio.h>
#include "esp_log.h"

static const char* TAG = "NO-LCD";

hd44780_t* lcd_drv_init(void)
{
    // lcd_bus_hd44780_t *bus = lcd_bus_gpio4_create(
    //     19,
    //     18,
    //     17,
    //     16,
    //     23,
    //     22
    // );

    // if (!bus) {
    //     return NULL;
    // }

    // hd44780_t *lcd = lcd_init(bus, HD44780_GEOMETRY_16X2, true);

    // if (!lcd) {
    //     return NULL;
    // }

    // lcd_clear_screen(lcd);
    // lcd_write_str(lcd, "<?> LiveLeaf");
    // lcd_set_cursor(lcd, 0, 1);
    // lcd_write_str(lcd, "~ Loading ...");

    return NULL;
}

void lcd_print_wifi(hd44780_t *lcd){
    // lcd_set_cursor(lcd, 0, 0);

    // wifi_mode_t mode;
    // if (esp_wifi_get_mode(&mode) == ESP_OK) {
    //     esp_netif_ip_info_t ip_info;
    //     esp_netif_t* netif = NULL;

    //     switch (mode) {
    //         case WIFI_MODE_NULL:
    //             lcd_write_str(lcd, "<!>");
    //             break;
                
    //         case WIFI_MODE_STA:
    //             netif = esp_netif_get_handle_from_ifkey("WIFI_STA_DEF");
    //             // Check if interface is up and has been assigned an IP address
    //             if (netif && esp_netif_get_ip_info(netif, &ip_info) == ESP_OK && ip_info.ip.addr != 0) {
    //                 lcd_write_str(lcd, "<->");
    //                 lcd_print_ip(lcd, "WIFI_STA_DEF");
    //             } else {
    //                 lcd_write_str(lcd, "<?>");
    //                 lcd_print_log(lcd, "Conn Fail/Wait");
    //             }
    //             break;
                
    //         case WIFI_MODE_AP:
    //             netif = esp_netif_get_handle_from_ifkey("WIFI_AP_DEF");
    //             if (netif && esp_netif_get_ip_info(netif, &ip_info) == ESP_OK && ip_info.ip.addr != 0) {
    //                 lcd_write_str(lcd, "<O>");
    //                 lcd_print_ip(lcd, "WIFI_AP_DEF");
    //             } else {
    //                 lcd_write_str(lcd, "<!>");
    //                 lcd_print_log(lcd, "AP Error");
    //             }
    //             break;
                
    //         default:
    //             break;
    //     }
    // }
    return;
}

void lcd_print_ip(hd44780_t *lcd, char* mode){
    // esp_netif_t *netif = esp_netif_get_handle_from_ifkey(mode); // "WIFI_STA_DEF" Or "WIFI_AP_DEF" for Access Point
    // esp_netif_ip_info_t ip_info;

    // char str[16];
    // if (netif != NULL && esp_netif_get_ip_info(netif, &ip_info) == ESP_OK) {
    //     snprintf(str, 16, IPSTR, IP2STR(&ip_info.ip));
    // }else{
    //     snprintf(str, 16, "Network Error");
    // }

    // lcd_set_cursor(lcd, 0, 1);
    // lcd_write_str(lcd, "                ");
    
    // lcd_set_cursor(lcd, 0, 1);
    // lcd_write_str(lcd, str);
}

void lcd_print_value(hd44780_t *lcd, char* label, float value, char* type, bool is_ok){
    // lcd_set_cursor(lcd, 3, 0);
    // lcd_write_str(lcd, "            "); // Print 12 spaces to clear columns 3 through 14
    // lcd_set_cursor(lcd, 3, 0);
    
    char str[13];
    if(value < 0){
        snprintf(str, 13, "%4.4s ERROR", label);
        is_ok = false;
    }else{
        snprintf(str, 13, "%4.4s %3.1f%1.1s %s", label, value, type, is_ok ? "K" : "!");
    }
    
    ESP_LOGI(TAG, "%s", str);
    // lcd_write_str(lcd, str);

    // lcd_set_cursor(lcd, 15, 0);
    // lcd_write_str(lcd, );
}

void lcd_print_log(hd44780_t *lcd, char* log){
    // lcd_set_cursor(lcd, 0, 1);
    // lcd_write_str(lcd, "                ");
    
    // char str[17];
    // snprintf(str, 17, "%14.14s..", log);
    
    // lcd_set_cursor(lcd, 0, 1);
    // lcd_write_str(lcd, str);
    ESP_LOGI(TAG, "%s" , log);

    // vTaskDelay(pdMS_TO_TICKS(2000));
}