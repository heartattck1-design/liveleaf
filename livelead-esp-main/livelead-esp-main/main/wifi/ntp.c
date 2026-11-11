/* LwIP SNTP example for ESP-IDF (Cairo / Egypt Timezone) */

#include "ntp.h"
#include <time.h>
#include <sys/time.h>
#include "esp_event.h"
#include "esp_log.h"
#include "esp_netif_sntp.h"
#include "lwip/ip_addr.h"
#include "esp_sntp.h"

static const char *TAG = "NTP";

static void obtain_time(void);

static void sntp_event_handler(void *arg, esp_event_base_t base, int32_t id, void *data)
{
    (void)arg; (void)base; (void)id;
    const esp_netif_sntp_time_sync_t *evt = (const esp_netif_sntp_time_sync_t *)data;
    if (evt) {
        char ts[64];
        time_t t = evt->tv.tv_sec;
        struct tm tm_utc;
        gmtime_r(&t, &tm_utc);
        strftime(ts, sizeof(ts), "%Y-%m-%d %H:%M:%S", &tm_utc);
        ESP_LOGI(TAG, "SNTP event: time synced (UTC): %s.%06ld", ts, (long)evt->tv.tv_usec);
    } else {
        ESP_LOGI(TAG, "SNTP event: time synced (no timeval provided)");
    }
}

void print_time(void)
{
    // 1. Sync time from SNTP first
    obtain_time();

    // 2. Set timezone to Egypt Standard Time (UTC+2) / Daylight Saving (UTC+3)
    setenv("TZ", "EET-2EEST,M4.5.5/0,M10.5.4/24", 1);
    tzset();

    // 3. Read synchronized time and format
    time_t now;
    struct tm timeinfo;
    time(&now);
    localtime_r(&now, &timeinfo);

    char strftime_buf[64];
    strftime(strftime_buf, sizeof(strftime_buf), "%Y-%m-%d %H:%M:%S", &timeinfo);;
    ESP_LOGI(TAG, "The current date/time in Cairo is: %s", strftime_buf);
}

static void obtain_time(void)
{
    // Register handler to log SNTP event with timeval payload
    ESP_ERROR_CHECK(esp_event_handler_register(NETIF_SNTP_EVENT, NETIF_SNTP_TIME_SYNC, &sntp_event_handler, NULL));

    ESP_LOGI(TAG, "Initializing and starting SNTP");

    esp_sntp_config_t config = ESP_NETIF_SNTP_DEFAULT_CONFIG("pool.ntp.org");
    config.sync_cb = NULL; // Using sntp_event_handler via default event loop instead
    esp_netif_sntp_init(&config);

    // Wait for time to be set
    int retry = 0;
    const int retry_count = 15;
    while (esp_netif_sntp_sync_wait(2000 / portTICK_PERIOD_MS) == ESP_ERR_TIMEOUT && ++retry < retry_count) {
        ESP_LOGI(TAG, "Waiting for system time to be set... (%d/%d)", retry, retry_count);
    }
}