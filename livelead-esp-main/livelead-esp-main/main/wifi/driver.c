#include "driver.h"

static const char* TAG = "wifi";

static void wifi_event_handler(void* arg, esp_event_base_t event_base, int32_t event_id, void* event_data){
    ESP_LOGI(TAG, "Event nr: %d!\n", event_id);

    // TBD
}

esp_err_t wifi_setup(){
    ESP_LOGI(TAG, "Setting up wifi... \n");

    ESP_RETURN_ON_ERROR(
        esp_netif_init()
        , TAG, "TCP/IP init failed");
    ESP_RETURN_ON_ERROR(
        esp_event_loop_create_default()
        , TAG, "creating wifi Eventloop failed");

    ESP_RETURN_ON_ERROR(
            esp_event_handler_instance_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &wifi_event_handler, NULL, NULL)
            , TAG, "register eventloop failed");

    return ESP_OK;
}

esp_err_t dhcp_setup(esp_netif_t* network){
    esp_netif_ip_info_t ip_info;
    
    IP4_ADDR(&ip_info.ip, 192, 168, 1, 1);
    IP4_ADDR(&ip_info.gw, 192, 168, 1, 1);
    IP4_ADDR(&ip_info.netmask, 255, 255, 255, 0);

    ESP_RETURN_ON_ERROR(
        esp_netif_dhcps_stop(network)
        , TAG, "stopping DHCP failed");
    
    ESP_RETURN_ON_ERROR(
        esp_netif_set_ip_info(network, &ip_info)
        ,TAG, "setting new ip  failed");
    
    ESP_RETURN_ON_ERROR(
        esp_netif_dhcps_start(network)
        , TAG, "starting DHCP failed");

    return ESP_OK;
}