#include "fatfs_driver.h"
#include "esp_check.h"

static const char* TAG = "FATFS";
const char *base_path = "/static";
const char *rw_path = "/data";

esp_err_t storage_setup(){
    // To mount device we need name of device partition, define base_path
    // and allow format partition in case if it is new one and was not formatted before
    esp_vfs_fat_mount_config_t mount_config = {
        .max_files = 4,
        .format_if_mount_failed = false,
        .allocation_unit_size = 0,
        .use_one_fat = false,
    };

    ESP_RETURN_ON_ERROR(
        esp_vfs_fat_spiflash_mount_ro(base_path, "data_r", &mount_config)
    , TAG, "mounting in r mode failed");

    
    // mounting in rw mode
    mount_config = (esp_vfs_fat_mount_config_t){
        .max_files = 4,
        .format_if_mount_failed = true,
        .allocation_unit_size = 0,
        .use_one_fat = false,
    };
    static wl_handle_t wl_handle = WL_INVALID_HANDLE;
    ESP_RETURN_ON_ERROR(
        esp_vfs_fat_spiflash_mount_rw_wl(rw_path, "data_rw", &mount_config, &wl_handle)
        , TAG, "mounting in rw mode failed");

    return ESP_OK;
}