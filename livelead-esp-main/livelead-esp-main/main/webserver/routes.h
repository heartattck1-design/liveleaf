#include "controler.h"
#include "esp_http_server.h"

static const httpd_uri_t starting_page_uri= {
    .uri       = "/",               // the address at which the resource can be found
    .method    = HTTP_GET,          // The HTTP method (HTTP_GET, HTTP_POST, ...)
    .handler   = starting_page_handle, // The function which process the request
    .user_ctx  = NULL               // Additional user data for context
};

static const httpd_uri_t setup_wifi_uri= {
    .uri       = "/setup/wifi",               // the address at which the resource can be found
    .method    = HTTP_POST,          // The HTTP method (HTTP_GET, HTTP_POST, ...)
    .handler   = setup_wifi_handle, // The function which process the request
    .user_ctx  = NULL               // Additional user data for context
};

static const httpd_uri_t setup_cloud_uri= {
    .uri       = "/setup/token",               // the address at which the resource can be found
    .method    = HTTP_POST,          // The HTTP method (HTTP_GET, HTTP_POST, ...)
    .handler   = setup_cloud_credentials, // The function which process the request
    .user_ctx  = NULL               // Additional user data for context
};

static const httpd_uri_t read_endpoint_uri= {
    .uri       = "/data",               // the address at which the resource can be found
    .method    = HTTP_GET,          // The HTTP method (HTTP_GET, HTTP_POST, ...)
    .handler   = read_endpoint_handle, // The function which process the request
    .user_ctx  = NULL               // Additional user data for context
};


static const httpd_uri_t set_soil_calibration_uri= {
    .uri       = "/calibrate/soil",               // the address at which the resource can be found
    .method    = HTTP_GET,          // The HTTP method (HTTP_GET, HTTP_POST, ...)
    .handler   = set_soil_calibration_handle, // The function which process the request
    .user_ctx  = NULL               // Additional user data for context
};


static const httpd_uri_t set_tank_calibration_uri= {
    .uri       = "/calibrate/tank",               // the address at which the resource can be found
    .method    = HTTP_GET,          // The HTTP method (HTTP_GET, HTTP_POST, ...)
    .handler   = set_tank_calibration_handle, // The function which process the request
    .user_ctx  = NULL               // Additional user data for context
};

static const httpd_uri_t send_metrics_logs_uri= {
    .uri       = "/logs/metrics",               // the address at which the resource can be found
    .method    = HTTP_GET,          // The HTTP method (HTTP_GET, HTTP_POST, ...)
    .handler   = send_metrics_logs_handle, // The function which process the request
    .user_ctx  = NULL               // Additional user data for context
};

static const httpd_uri_t send_watering_logs_uri= {
    .uri       = "/logs/watering",               // the address at which the resource can be found
    .method    = HTTP_GET,          // The HTTP method (HTTP_GET, HTTP_POST, ...)
    .handler   = send_watering_logs_handle, // The function which process the request
    .user_ctx  = NULL               // Additional user data for context
};

static const httpd_uri_t start_watering_uri= {
    .uri       = "/action/watering",               // the address at which the resource can be found
    .method    = HTTP_GET,          // The HTTP method (HTTP_GET, HTTP_POST, ...)
    .handler   = starting_page_handle, // The function which process the request
    .user_ctx  = NULL               // Additional user data for context
};

static const httpd_uri_t plant_set_info_uri= {
    .uri       = "/action/plant/info/pull",               // the address at which the resource can be found
    .method    = HTTP_POST,          // The HTTP method (HTTP_GET, HTTP_POST, ...)
    .handler   = plant_set_info_handle, // The function which process the request
    .user_ctx  = NULL               // Additional user data for context
};