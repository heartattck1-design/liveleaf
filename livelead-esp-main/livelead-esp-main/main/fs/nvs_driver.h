#ifndef NVS_H
#define NVS_H

#include "nvs_flash.h"

#include <esp_check.h>
#include <esp_log.h>

typedef struct {
    nvs_handle_t handle;
    esp_err_t err;
} nvs_statues_t;

esp_err_t nvs_init(void);
nvs_handle_t open_nvs_handle(void);
esp_err_t commit_nvs(nvs_handle_t handle);
esp_err_t close_nvs(nvs_handle_t handle);
esp_err_t store_nvs_int(nvs_handle_t handle, char* key, int32_t value);
esp_err_t read_nvs_int(nvs_handle_t handle, int32_t* target, char* key);
esp_err_t store_nvs_str(nvs_handle_t handle, char* key, char* value);
size_t read_nvs_str_size(nvs_handle_t handle, char* key);
esp_err_t read_nvs_str(nvs_handle_t handle, char* target, char* key, size_t required_size);

#endif