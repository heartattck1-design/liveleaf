#include "ap.h"
#include "lwip/inet.h"

#define ESP_WIFI_SSID "LiveLeaf Setup"
#define ESP_WIFI_PASS "liveleaf"
#define ESP_WIFI_CHANNEL 1
#define MAX_STA_CONN 2
// #define CAPTIVE_PORTAL_URL "http://192.168.1.1/"

static const char* TAG = "wifi_ap";

esp_err_t wifi_ap_setup(){
    esp_netif_t *ap = esp_netif_create_default_wifi_ap();

    ESP_RETURN_ON_ERROR(
        dhcp_setup(ap)
        , TAG, "Setup DHCP Failed");

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT(); // always start with this

    ESP_RETURN_ON_ERROR(
        esp_wifi_init(&cfg)
        , TAG, "Wifi starting failed");

    wifi_config_t wifi_config = {
        .ap = {
            .ssid = ESP_WIFI_SSID,
            .ssid_len = strlen(ESP_WIFI_SSID),
            .channel = ESP_WIFI_CHANNEL,
            .password = ESP_WIFI_PASS,
            .max_connection = MAX_STA_CONN,
            .authmode = WIFI_AUTH_WPA2_PSK,
            .pmf_cfg = {
                .required = true,
            },
        },
    };

    ESP_RETURN_ON_ERROR(
        esp_wifi_set_mode(WIFI_MODE_AP)
        , TAG, "setting wifi to ap failed");

    ESP_RETURN_ON_ERROR(
        esp_wifi_set_config(WIFI_IF_AP, &wifi_config)
        , TAG, "setting ap config failed");

    ESP_RETURN_ON_ERROR(
        esp_wifi_start()
        , TAG, "starting wifi failed");

    ESP_LOGI(TAG, "wifi AP Soft init finished. SSID:%s password:%s channel:%d",
        ESP_WIFI_SSID, ESP_WIFI_PASS, ESP_WIFI_CHANNEL);

    return ESP_OK;
}

// esp_err_t dhcp_set_captiveportal_url(void) {
//     // get a handle to configure DHCP with
//     esp_netif_t* netif = esp_netif_get_handle_from_ifkey("WIFI_AP_DEF");

//     // set the DHCP option 114
//     ESP_ERROR_CHECK_WITHOUT_ABORT(
//         esp_netif_dhcps_stop(netif)
//     );

//     ESP_ERROR_CHECK(
//         esp_netif_dhcps_option(netif, ESP_NETIF_OP_SET, ESP_NETIF_CAPTIVEPORTAL_URI, CAPTIVE_PORTAL_URL, strlen(CAPTIVE_PORTAL_URL))
//     );

//     ESP_ERROR_CHECK_WITHOUT_ABORT(
//         esp_netif_dhcps_start(netif)
//     );

//     return ESP_OK;
// }