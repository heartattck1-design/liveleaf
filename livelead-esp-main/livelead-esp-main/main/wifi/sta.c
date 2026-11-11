#include "sta.h"
#include "app/main_app.h"
#include "devices/lcd.h"
#include "esp_check.h"
#include "esp_err.h"
#include "esp_wifi_types_generic.h"
#include "fs/nvs_driver.h"
#include "webserver/ws.h"
#include "wifi/ap.h"
#include <stddef.h>
#include <stdio.h>
#include "mdns.h"
#include <string.h>

#define ESP_MAXIMUM_RETRY   5
#define WIFI_CONNECTED_BIT  BIT0
#define WIFI_FAIL_BIT       BIT1

#define ESP_WIFI_SCAN_AUTH_MODE_THRESHOLD   WIFI_AUTH_WPA_WPA2_PSK

static const char* TAG = "WIFI STA";

static EventGroupHandle_t s_wifi_event_group;
static int s_retry_num = 0;

static void event_handler(void* arg, esp_event_base_t event_base,
                                int32_t event_id, void* event_data)
{
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START) {
        esp_wifi_connect();

    } else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED) {
        // retry to connect if disconnected
        if (s_retry_num < ESP_MAXIMUM_RETRY) {
            esp_wifi_connect();
            s_retry_num++;
            ESP_LOGI(TAG, "retry %d to connect to the AP", s_retry_num);
            
            // update s_wifi_event_group statues
        } else {
            xEventGroupSetBits(s_wifi_event_group, WIFI_FAIL_BIT);
            ESP_LOGI(TAG,"connect to the AP fail");
            wifi_ap_setup();
        }
        
    // wifi is connected! printing the IP, reset the retry counter and update 
    // the s_wifi_retry_group with a connected value
    } else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP) {
        ip_event_got_ip_t* event = (ip_event_got_ip_t*) event_data;
        ESP_LOGI(TAG, "got ip:" IPSTR, IP2STR(&event->ip_info.ip));
        s_retry_num = 0;
        xEventGroupSetBits(s_wifi_event_group, WIFI_CONNECTED_BIT);
    }
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_CONNECTED) {
        app_websocket_start();
    }
}

// init the network
static esp_err_t wifi_sta_init(){
    wifi_setup();

    s_wifi_event_group = xEventGroupCreate();

    esp_netif_create_default_wifi_sta();
    
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    
    ESP_RETURN_ON_ERROR(
        esp_wifi_init(&cfg),
        TAG, "failed to init sta network config"
    );
    
    // start eventloop to handle interrupts and events
    esp_event_handler_instance_t instance_any_id;
    esp_event_handler_instance_t instance_got_ip;
    
    ESP_ERROR_CHECK(
        esp_event_handler_instance_register(WIFI_EVENT,
                                                        ESP_EVENT_ANY_ID,
                                                        &event_handler,
                                                        NULL,
                                                        &instance_any_id)
    );
    ESP_ERROR_CHECK(
        esp_event_handler_instance_register(IP_EVENT,
                                                        IP_EVENT_STA_GOT_IP,
                                                        &event_handler,
                                                        NULL,
                                                        &instance_got_ip)
    );

    return ESP_OK;
}

// getting network information to connect
static wifi_config_t wifi_sta_config(nvs_handle_t* handle){
    wifi_config_t config = {
        .sta = {
            .scan_method = WIFI_ALL_CHANNEL_SCAN,
            .failure_retry_cnt = ESP_MAXIMUM_RETRY,
            .threshold.authmode = ESP_WIFI_SCAN_AUTH_MODE_THRESHOLD,
        },
    };
    
    char ssid[32];
    char pwd[64];

    int ssid_len = read_nvs_str_size(*handle, "ssid");
    int pwd_len = read_nvs_str_size(*handle, "pwd");

    ESP_ERROR_CHECK(
        read_nvs_str(*handle, ssid, "ssid", ssid_len)
    );
    
    ESP_ERROR_CHECK(
        read_nvs_str(*handle, pwd, "pwd", pwd_len)
    );

    strncpy((char *) config.sta.ssid, ssid, ssid_len);
    strncpy((char *) config.sta.password, pwd, pwd_len);
    
    return config;
}

// connecting to the network
static esp_err_t wifi_sta_start(wifi_config_t* wifi_config){
    ESP_RETURN_ON_ERROR(
        esp_wifi_set_mode(WIFI_MODE_STA)
        , TAG, "setting wifi mode to STA failed"
    );

    ESP_RETURN_ON_ERROR(
        esp_wifi_set_config(WIFI_IF_STA, wifi_config)
        , TAG, "setting config to connect sta failed"
    );

    ESP_RETURN_ON_ERROR(
        esp_wifi_start()
        , TAG, "Connecting to wifi failed" 
    );
    
    return ESP_OK;
}

esp_err_t wifi_sta_connect(nvs_handle_t *handle)
{
    wifi_sta_init();
    wifi_config_t wifi_config = wifi_sta_config(handle);
    wifi_sta_start(&wifi_config);

    ESP_LOGI(TAG, "wifi_init_sta finished.");

    /* Waiting until either the connection is established (WIFI_CONNECTED_BIT) or connection failed for the maximum
     * number of re-tries (WIFI_FAIL_BIT). The bits are set by event_handler() (see above) */
    EventBits_t bits = xEventGroupWaitBits(s_wifi_event_group,
            WIFI_CONNECTED_BIT | WIFI_FAIL_BIT,
            pdFALSE,
            pdFALSE,
            portMAX_DELAY);

    /* xEventGroupWaitBits() returns the bits before the call returned, hence we can test which event actually
     * happened. */
    if (bits & WIFI_CONNECTED_BIT) {
        ESP_LOGI(TAG, "WIFI connected");
    } else if (bits & WIFI_FAIL_BIT) {
        ESP_LOGI(TAG, "Failed to connect to WIFI");
    } else {
        ESP_LOGE(TAG, "UNEXPECTED EVENT");
    }

    return ESP_OK;
}

void start_mdns(void)
{
    ESP_ERROR_CHECK(mdns_init());
    ESP_ERROR_CHECK(mdns_hostname_set("liveleaf"));
    ESP_ERROR_CHECK(mdns_instance_name_set("LiveLeaf Demo Device"));

    // Optional: advertise a service so clients can discover it by type
    ESP_ERROR_CHECK(mdns_service_add("LiveLeaf", "_http", "_tcp", 80, NULL, 0));
}