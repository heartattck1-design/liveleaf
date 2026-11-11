#ifndef WEBSERVER_APP_H
#define WEBSERVER_APP_H

#include "esp_err.h"
#include "esp_http_server.h"

#define MAX_PAYLOAD_SIZE 2048

esp_err_t recv_req_data(httpd_req_t* req, char* buffer);
void send_req_data(FILE* file, httpd_req_t* req);
esp_err_t webserver_register();

#endif