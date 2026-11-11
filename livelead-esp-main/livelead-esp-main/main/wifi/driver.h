#ifndef WIFI_DRIVER_H
#define WIFI_DRIVER_H

#include <esp_wifi.h>
#include <lwip/ip4_addr.h>

#include <esp_check.h>
#include <esp_log.h>

esp_err_t wifi_setup(void);
esp_err_t dhcp_setup(esp_netif_t* network);

#endif