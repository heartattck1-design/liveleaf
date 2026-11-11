## 1. Server to ESP32 (Incoming Events)

The ESP32 listens for a single primary Socket.IO event called `device_command`. The action to perform is determined by the `action` field within the payload.

### Event: `device_command`

**Description:** Directs the ESP32 to perform a specific action.
**General Wrapper:** `42["device_command", { PAYLOAD }]`

#### Action: `push_sensor_val`

Requests the ESP32 to immediately read and publish the current sensor values.

```json
{
  "req_id": "string", 
  "action": "push_sensor_val"
}

```

#### Action: `push_sensor_log`

Requests the ESP32 to upload the metrics log file (`/data/log_metrics.csv`) as a binary stream.

```json
{
  "req_id": "string",
  "action": "push_sensor_log"
}

```

#### Action: `push_watering_log`

Requests the ESP32 to upload the watering log file (`/data/log_watering.csv`) as a binary stream.

```json
{
  "req_id": "string",
  "action": "push_watering_log"
}

```

#### Action: `start_watering`

Triggers the water pump for a specified duration.

```json
{
  "req_id": "string",
  "action": "start_watering",
  "duration": "number" // Duration in seconds (ESP32 multiplies this by 1000 for ms)
}

```

#### Action: `save_plant_data`

Updates the environmental thresholds and settings in the ESP32's non-volatile storage (NVS).

```json
{
  "req_id": "string",
  "action": "save_plant_data",
  "data": {
    "h_soil": "number (optional)",   // High soil moisture threshold
    "l_soil": "number (optional)",   // Low soil moisture threshold
    "h_temp": "number (optional)",   // High temperature threshold
    "l_temp": "number (optional)",   // Low temperature threshold
    "h_humi": "number (optional)",   // High humidity threshold
    "l_humi": "number (optional)",   // Low humidity threshold
    "interval": "number (optional)"  // Sensor reading/reporting interval
  }
}

```

---

## 2. ESP32 to Server (Outgoing Events)

The ESP32 emits the following events back to the Server.

### Event: `device_response`

**Description:** Acknowledges the receipt and execution status of a `device_command`.
**Socket.IO Format:** `42["device_response", { PAYLOAD }]`

```json
{
  "req_id": "string",          // Matches the req_id from the incoming command
  "status": "string"           // "success" or "failed"
}

```

### Event: `sensor_data`

**Description:** Pushes the current telemetry data from the sensors. Triggered either periodically by the ESP32 or manually via the `push_sensor_val` command.
**Socket.IO Format:** `42["sensor_data", { PAYLOAD }]`

```json
{
  "temp": "number", // Temperature (e.g., in Celsius)
  "humi": "number", // Humidity percentage
  "lamp": "number", // Light intensity (LDR reading)
  "soil": "number", // Soil moisture level
  "tank": "number"  // Water tank level
}

```

---

## 3. Binary Data Streams (ESP32 to Server)

When the ESP32 receives `push_sensor_log` or `push_watering_log`, it bypasses standard JSON Socket.IO events and sends raw WebSocket binary frames.

* **Format:** Raw binary chunks (1024 bytes / 1 KB per chunk).
* **Behavior:**
* The first chunk is sent as a partial binary message (`send_bin_partial`).
* Subsequent chunks are sent as continuations (`send_cont_msg`).
* The transmission is closed with a `FIN` frame.


* **Server Requirement:** The backend WebSocket/Socket.IO server must be configured to handle raw binary fragments concurrently with standard text-based Socket.IO payloads.