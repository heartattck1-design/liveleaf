#pragma once
#include "esp_err.h"
// #include "hd44780.h"

typedef int hd44780_t ;

hd44780_t* lcd_drv_init(void);
void lcd_print_log(hd44780_t *lcd, char* log);
void lcd_print_ip(hd44780_t *lcd, char* mode);
void lcd_print_wifi(hd44780_t *lcd);
void lcd_print_value(hd44780_t *lcd, char* label, float value, char* type, bool is_ok);