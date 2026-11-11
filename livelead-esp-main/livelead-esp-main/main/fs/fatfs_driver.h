#ifndef FATFS_DRIVER_H
#define FATFS_DRIVER_H

#include <esp_check.h>
#include <esp_log.h>
#include "esp_vfs_fat.h"

extern const char *base_path;

esp_err_t storage_setup();

#endif