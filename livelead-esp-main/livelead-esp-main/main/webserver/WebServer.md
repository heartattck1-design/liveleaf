# ESP32 Smart Plant Controller - HTTP REST API Specification

This document provides the full API specification for the embedded HTTP server implemented via ESP-IDF `esp_http_server`.

---

## Global Error Responses

Unless specifically handled by custom text responses, default ESP-IDF error handlers emit the following status bodies:

* **`400 Bad Request`**: Sent when required query/JSON fields fail validation or types mismatch.
* **`500 Internal Server Error`**: Sent when memory allocation (`malloc`), JSON parsing (`cJSON_Parse`), NVS storage, or hardware peripheral I/O fails.

---

## Endpoints

### 1. Root / UI Portal

Returns the device frontend interface depending on the operational Wi-Fi state.

* **URL:** `/`
* **Method:** `GET`
* **Handler:** `starting_page_handle`
* **Headers:**
* `Content-Type: text/html`



#### Responses

* **`200 OK`**
* Condition: Successfully read static HTML file.
* Content: Chunked transfer of `/static/dashboard.html` (if `WIFI_MODE_STA`) or `/static/setup.html` (Default / AP mode).


* **`500 Internal Server Error`**
* Condition: File pointer is `NULL` (filesystem read error).
* Body: `Failed to open HTML file`



---

### 2. Wi-Fi Configuration

Configures Wi-Fi credentials in persistent Non-Volatile Storage (NVS).

* **URL:** `/setup/wifi`
* **Method:** `POST`
* **Handler:** `setup_wifi_handle`
* **Request Headers:**
* `Content-Type: application/json`


* **Request Body:**

```json
{
  "ssid": "HomeNetwork_2.4G",
  "pwd": "SecretPassword123"
}

```

#### Responses

* **`200 OK`**
* Content-Type: `text/plain`
* Body: `OK`


* **`400 Bad Request`**
* Condition: JSON values for `ssid` or `pwd` are missing, null, or not strings.
* Body: `Missing SSID or password`


* **`500 Internal Server Error`**
* Condition 1: Failed to allocate buffer for incoming payload (`Failed to allocate memory to receive the request`).
* Condition 2: Incoming packet reception failed via `recv_req_data`.
* Condition 3: Invalid JSON syntax in payload.
* Condition 4: Failed to open NVS storage (`Failed to open nvs`).



---

### 3. Cloud / Backend Configuration

Sets the cloud endpoint address and authentication token.

* **URL:** `/setup/token`
* **Method:** `POST`
* **Handler:** `setup_cloud_credentials`
* **Request Headers:**
* `Content-Type: application/json`


* **Request Body:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "url": "192.168.1.150"
}

```

*(Note: Parameter `url` is saved internally to the `ip` NVS key).*

#### Responses

* **`200 OK`**
* Content-Type: `text/plain`
* Body: `OK`


* **`400 Bad Request`**
* Condition: `token` or `url` values are not valid strings.
* Body: `Missing SSID or password`


* **`500 Internal Server Error`**
* Condition 1: Out of memory during buffer allocation (`Failed to allocate memory to receive the request`).
* Condition 2: Packet reception failed.
* Condition 3: Malformed JSON.
* Condition 4: Failed to open NVS handle (`Failed to open nvs`).



---

### 4. Live Sensor Telemetry

Retrieves current environmental and plant sensor readings.

* **URL:** `/data`
* **Method:** `GET`
* **Handler:** `read_endpoint_handle`
* **Response Headers:**
* `Content-Type: application/json`
* `Access-Control-Allow-Origin: *`
* `Cache-Control: no-store`



#### Responses

* **`200 OK`**

```json
{
  "temp": 24.5,
  "humi": 60.0,
  "lamp": 340,
  "soil": 78,
  "tank": 92
}

```

* **`500 Internal Server Error`**
* Condition: Failed to allocate cJSON object or render string representation.



---

### 5. Soil Moisture Sensor Calibration

Samples the raw analog reading from the soil sensor and persists it to NVS as the baseline calibration mark.

* **URL:** `/calibrate/soil`
* **Method:** `GET`
* **Handler:** `set_soil_calibration_handle`

#### Responses

* **`200 OK`**
* Content-Type: `text/plain`
* Body: `OK`


* **`500 Internal Server Error`**
* Condition: Sensor read routine returned non-OK status.
* Body: `calibrate again`



---

### 6. Water Tank Sensor Calibration

Samples raw depth/level reading from the tank sensor and stores it in NVS.

* **URL:** `/calibrate/tank`
* **Method:** `GET`
* **Handler:** `set_tank_calibration_handle`

#### Responses

* **`200 OK`**
* Content-Type: `text/plain`
* Body: `OK`


* **`500 Internal Server Error`**
* Condition: Water level sensor read routine returned non-OK status.
* Body: `calibrate again`



---

### 7. Manual Watering Trigger

Triggers the water pump for a specific duration.

> **Implementation Note:** The registration table binds this endpoint to `starting_page_handle` by mistake in the C code (`.handler = starting_page_handle`). The schema below documents the intended `start_watering_handle` implementation.

* **URL:** `/action/watering`
* **Method:** `POST` *(Registered as `HTTP_GET` in struct, but parses an incoming payload)*
* **Handler:** `start_watering_handle`
* **Request Headers:**
* `Content-Type: application/json`


* **Request Body:**

```json
{
  "duration": 5
}

```

*(Note: `duration` is provided in seconds; the firmware converts this to milliseconds by multiplying by 1000).*

#### Responses

* **`200 OK`**
* Content-Type: `text/plain`
* Body: `OK`


* **`400 Bad Request`**
* Condition: `duration` field is missing or not a numeric type.
* Body: `Missing duration`


* **`500 Internal Server Error`**
* Condition: Payload reception failure, memory allocation error, or invalid JSON.



---

### 8. Download Metrics Logs

Streams the recorded historical metrics log file.

* **URL:** `/logs/metrics`
* **Method:** `GET`
* **Handler:** `send_metrics_logs_handle`
* **Headers:**
* `Content-Type: text/csv`



#### Responses

* **`200 OK`**
* Body: Chunked stream of `/data/log_metrics.csv`


* **`500 Internal Server Error`**
* Condition: File cannot be opened or does not exist.
* Body: `Failed to open HTML file`



---

### 9. Download Watering Logs

Streams the historical watering event log file.

* **URL:** `/logs/watering`
* **Method:** `GET`
* **Handler:** `send_watering_logs_handle`
* **Headers:**
* `Content-Type: text/csv`



#### Responses

* **`200 OK`**
* Body: Chunked stream of `/data/log_watering.csv`


* **`500 Internal Server Error`**
* Condition: File cannot be opened or does not exist.
* Body: `Failed to open HTML file`



---

### 10. Plant Target Thresholds & Telemetry Setup

Configures sensor thresholds and logging intervals. All fields are optional numeric parameters; omitted fields keep their current values in NVS.

* **URL:** `/action/plant/info/pull`
* **Method:** `POST`
* **Handler:** `plant_set_info_handle`
* **Request Headers:**
* `Content-Type: application/json`


* **Request Body:**

```json
{
  "h_soil": 80,
  "l_soil": 30,
  "h_temp": 32,
  "l_temp": 15,
  "h_humi": 70,
  "l_humi": 40,
  "interval": 300
}

```

| Field | Type | Description |
| --- | --- | --- |
| `h_soil` | Integer | Upper threshold for soil moisture |
| `l_soil` | Integer | Lower threshold for soil moisture |
| `h_temp` | Integer | Upper temperature boundary |
| `l_temp` | Integer | Lower temperature boundary |
| `h_humi` | Integer | Upper humidity boundary |
| `l_humi` | Integer | Lower humidity boundary |
| `interval` | Integer | Logging/telemetry sync cycle time |

#### Responses

* **`200 OK`**
* Content-Type: `text/plain`
* Body: `OK`


* **`500 Internal Server Error`**
* Condition 1: Out of memory buffer failure (`Failed to allocate memory to receive the request`).
* Condition 2: Request payload stream receive error.
* Condition 3: Malformed JSON payload.
* Condition 4: Failed to open NVS storage (`Failed to open NVS`).



---

## Discrepancies & Firmware Warnings

1. **Handler Mismatch on `/action/watering`:**
* In `start_watering_uri`, `.handler` points to `starting_page_handle` instead of `start_watering_handle`.
* The HTTP method is set to `HTTP_GET`, while the handler reads a request body (standard behavior expects `HTTP_POST`).


2. **Double Free / Memory Safety in `start_watering_handle`:**
* The cleanup label contains both `cJSON_Delete(root)` and `cJSON_free(root)`. Calling both causes undefined memory behavior / heap corruption. Only `cJSON_Delete(root)` should be called.


3. **Copy-Paste Error Strings:**
* In `send_metrics_logs_handle` and `send_watering_logs_handle`, error messages state `"Failed to open HTML file"` instead of CSV file errors.
* In `setup_cloud_credentials`, error message states `"Missing SSID or password"` instead of token/URL.


4. **Missing NVS Commit:**
* `plant_set_info_handle` stores values with `store_nvs_int`, but never calls `commit_nvs(nvs_handle)`. Settings may be lost across device reboots.