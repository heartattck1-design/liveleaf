#include "nvs_driver.h"
#include "esp_check.h"
#include "esp_err.h"
#include "lwip/def.h"
#include "nvs.h"
#include <stddef.h>
#include <stdio.h>

static const char* TAG = "NVS Storage";
static const char* namespace = "nvs";

esp_err_t nvs_init(){
    // Initialize NVS
    esp_err_t err = nvs_flash_init();
    if (err == ESP_ERR_NVS_NO_FREE_PAGES || err == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        // NVS partition was truncated and needs to be erased
        // Retry nvs_flash_init
        ESP_ERROR_CHECK(
            nvs_flash_erase()
        );
        err = nvs_flash_init();
    }
    ESP_ERROR_CHECK(
        err
    );
    
    return err;
}

nvs_handle_t open_nvs_handle(){
    // Open NVS handle

    nvs_handle_t handle;
    esp_err_t err = nvs_open(namespace, NVS_READWRITE, &handle);
    if(err != ESP_OK){
        ESP_LOGE(TAG, "Failed to open NVS");
        return 0;
    }
    
    return handle;
}

esp_err_t commit_nvs(nvs_handle_t handle){
    // Commit changes
    // After setting any values, nvs_commit() must be called to ensure changes are written
    // to flash storage. Implementations may write to storage at other times,
    // but this is not guaranteed.    
    ESP_RETURN_ON_ERROR(
        nvs_commit(handle)
        , TAG, "committing to nvs storage failed");

    return ESP_OK;
}

esp_err_t close_nvs(nvs_handle_t handle){
    nvs_close(handle);
    return ESP_OK;
}


esp_err_t store_nvs_int(nvs_handle_t handle, char* key, int32_t value){
    // Store and read an integer value    
    ESP_RETURN_ON_ERROR(
        nvs_set_i32(handle, key, value)
        , TAG, "Writing to NVS Failed");

    return ESP_OK;
}

esp_err_t read_nvs_int(nvs_handle_t handle, int32_t* target, char* key){
    // Read back the value
    esp_err_t err = nvs_get_i32(handle, key, target);

    switch (err) {
        case ESP_OK:
            ESP_LOGI(TAG, "Read counter = %" PRIu32, target);
            break;
        case ESP_ERR_NVS_NOT_FOUND:
            ESP_LOGW(TAG, "The value is not initialized yet!");
            break;
        default:
            ESP_LOGE(TAG, "Error (%s) reading!", esp_err_to_name(err));
    }
    return err;
}

esp_err_t store_nvs_str(nvs_handle_t handle, char* key, char* value){
    // Store and read a string
    ESP_LOGI(TAG, "\nWriting string to NVS...");
    
    ESP_RETURN_ON_ERROR(
        nvs_set_str(handle, key, value)
        , TAG, "Writing to NVS Failed");

    return ESP_OK;
}

size_t read_nvs_str_size(nvs_handle_t handle, char* key){
    size_t required_size = 0;
    
    if(nvs_get_str(handle, key, NULL, &required_size) == ESP_ERR_NVS_NOT_FOUND){
        return -1;
    }

    return required_size;
}

esp_err_t read_nvs_str(nvs_handle_t handle, char* target, char* key, size_t required_size){
    // Read back the string    
    ESP_RETURN_ON_ERROR(
        nvs_get_str(handle, key, target, &required_size)
        , TAG, "getting string failed");

    return ESP_OK;
}
