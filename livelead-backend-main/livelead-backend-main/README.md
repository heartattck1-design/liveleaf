# LiveLeaf Backend Documentation

This documentation provides a comprehensive guide to setting up and interacting with the LiveLeaf backend. The server is built using Python (Flask) and integrates RESTful APIs, JWT-based authentication, WebSocket (Socket.IO) for real-time IoT (ESP32) communication, and an SQLite database.

---

## 📂 File Structure Overview

Based on your project directory, here are the core files and their purposes:

* **`main.py`**: The core Flask web server containing all API routes, database logic, and SocketIO event handlers.
* **`migrate.py`**: The database migration script. Run this to initialize the SQLite database schema (`app.db`).
* **`app.db`**: The SQLite database file generated after running `migrate.py`.
* **`requirements.txt`**: Contains Python dependencies required to run the server.

---

## 🚀 Setup & Installation

**1. Install Dependencies**
Ensure you have Python 3.x installed. Navigate to the root directory and install the required packages:

```bash
pip install -r requirments.txt

```

*(Note: ensure `flask`, `flask-jwt-extended`, `flask-socketio`, `flask-cors`, and `eventlet` are present in your requirements).*

**2. Initialize the Database**
Run the migration script to create the necessary tables (`users`, `plants`, `user_plants`):

```bash
python migrate.py

```

**3. Run the Server**
Start the application (runs on `[http://0.0.0.0:5000](http://0.0.0.0:5000)` by default):

```bash
python main.py

```

---

## 🔒 Authentication

Endpoints marked with **[JWT Required]** require an authorization header with a valid Bearer token obtained from `/user/login` or `/user/signup`.

**Header Format:**

```http
Authorization: Bearer <your_access_token>

```

---

## 🌐 REST API Endpoints

### 1. General

#### `GET /`

Check if the API is running.

* **Response (200 OK):**
```json
{ "msg": "hello, World!" }

```



---

### 2. User Management

#### `POST /user/signup`

Creates a new user account and returns an authentication token.

* **Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

```


* **Success Response (201 Created):**
```json
{
  "msg": "Signup successful",
  "data": {
    "userid": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
}

```


* **Error Responses:**
* `400 Bad Request`: `{ "msg": "Email and password are required" }`
* `400 Bad Request`: `{ "msg": "Email is already in use" }`



#### `POST /user/login`

Authenticates a user and returns a JWT token.

* **Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}

```


* **Success Response (200 OK):**
```json
{
  "msg": "Login successful",
  "data": {
    "userid": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
}

```


* **Error Responses:**
* `400 Bad Request`: `{ "msg": "Email and password are required" }`
* `401 Unauthorized`: `{ "msg": "There is no user associated to this email" }` OR `{ "msg": "Invalid credentials" }`



---

### 3. Plants Catalog

#### `GET /plant`

Retrieves a list of all available plants in the global database.

* **Success Response (200 OK):**
```json
{
  "data": [
    {
      "plant_id": 1,
      "scientific_name": "Monstera deliciosa",
      "common_name": "Swiss Cheese Plant",
      "...": "..."
    }
  ]
}

```



#### `GET /plant/<id>`

Retrieves details for a specific plant by ID.

* **Success Response (200 OK):**
```json
{
  "data": {
    "plant_id": 1,
    "common_name": "Swiss Cheese Plant",
    "...": "..."
  }
}

```


* **Error Response (404 Not Found):**
```json
{ "msg": "Plant with ID 1 not found" }

```



---

### 4. User's Personal Garden

#### `POST /plant/add` **[JWT Required]**

Adds a specific plant to the authenticated user's profile.

* **Body (JSON):**
```json
{
  "plant_id": 1,
  "growth_stage": "seedling" 
}

```


*(Note: `growth_stage` is optional and defaults to `"seedling"`).*
* **Success Response (200 OK):**
```json
{
  "msg": "Plant id 1 added to user 1 list",
  "data": {
    "user_id": "1",
    "plant_id": 1,
    "growth_stage": "seedling"
  }
}

```


* **Error Responses:**
* `400 Bad Request`: `{ "msg": "plant_id is required" }`
* `404 Not Found`: `{ "msg": "Plant with ID 1 not found" }`



#### `GET /plant/my` **[JWT Required]**

Retrieves the list of plants added to the current user's profile.

* **Success Response (200 OK):**
```json
{
  "data": [
    {
      "plant_id": 1,
      "growth_stage": "seedling",
      "scientific_name": "Monstera deliciosa",
      "common_name": "Swiss Cheese Plant",
      "light_requirements": "Indirect sunlight",
      "water_needed": "Medium",
      "optimum_soil_moisture_pct": 60.5,
      "critical_drought_pct": 20.0
    }
  ]
}

```



---

### 5. IoT Device (ESP32) Commands

#### `POST /device/command` **[JWT Required]**

Sends an action command to the user's connected IoT device (via WebSocket) and waits for a response from the device.

* **Body (JSON):**
```json
{
  "action": "turn_on_pump"
}

```


* **Success Response (200 OK) (If device replies within 5 seconds):**
```json
{
  "msg": "Command 'turn_on_pump' executed successfully",
  "device_response": {
    "req_id": "1234-abcd-5678",
    "status": "pump_is_on"
  }
}

```

- `{ "action": "push_sensor_val"}`
```json
{
  "device_response": {
    "data": {
      "humi": -1,
      "lamp": 762,
      "soil": 1215,
      "tank": 439,
      "temp": -1
    },
    "req_id": "72e6fb74-1f41-49ef-9a1c-42a7537465d9",
    "status": "success"
  },
  "msg": "Command 'push_sensor_val' executed successfully"
}
```

- `{ "action": "push_sensor_log"}`
```json
{
  "csv_url": "/download/logs/5704918d_log_metrics.csv",
  "device_response": {
    "req_id": "431066d0-ef68-4c17-8aa7-e34cf544246b",
    "status": "success"
  },
  "msg": "Command 'push_sensor_log' executed successfully"
}
```

- `{ "action": "push_watering_log"}`
```json
{
  "csv_url": "/download/logs/21ad3955_log_watering.csv",
  "device_response": {
    "req_id": "6110e12a-3e7a-4a35-83c8-06e26500dba8",
    "status": "success"
  },
  "msg": "Command 'push_watering_log' executed successfully"
}```

- `/download/logs/21ad3955_log_watering.csv` returns a csv file, receive it as `text/csv`

- GET [JWT_TOKEN] `http://127.0.0.1:5000/device/connected`
```json
{
  "data": {
    "active_sessions": [
      "KIAzBzpy1Z0cbE6eAAAB"
    ],
    "connected_count": 1,
    "user_id": "1"
  },
  "msg": "Connected devices retrieved successfully"
}
```
or
```json
{
  "data": {
    "active_sessions": [],
    "connected_count": 0,
    "user_id": "1"
  },
  "msg": "Connected devices retrieved successfully"
}
```

- `{ "action": "start_watering", "duration": 7 }` duration be in seconds
```json
{
  "csv_url": "/download/logs/21ad3955_log_watering.csv",
  "device_response": {
    "req_id": "6110e12a-3e7a-4a35-83c8-06e26500dba8",
    "status": "success"
  },
  "msg": "Command 'push_watering_log' executed successfully"
}``` 

- ```json
{
  "action": "save_plant_data",
  "data": {
    "h_soil": 70,
    "l_soil": 30,
    "h_temp": 23,
    "l_temp": 55,
    "h_humi": 23,
    "l_humi": 90,
    "interval": 2
  }
}```
duration be in seconds

```json
{
  "device_response": {
    "req_id": "bf76bb34-1e2e-4f23-aeb8-94ddd7fa3112",
    "status": "success"
  },
  "msg": "Command 'save_plant_data' executed successfully"
}
``` 

* **Error Responses:**
* `400 Bad Request`: `{ "msg": "Action is required" }`
* `504 Gateway Timeout`: `{ "msg": "Device timeout. No response received." }` (Triggers if ESP32 doesn't reply within 5s).

---

## 📡 WebSocket (Socket.IO) Documentation

The backend uses Socket.IO to communicate with frontend clients and IoT devices (like ESP32 boards).

### Connection

To connect to the WebSocket, the client/device MUST pass the JWT token in the query string. This adds them to a private room based on their `user_id`.

* **URL Format:** `ws://<server-ip>:5000/?token=<your_jwt_token>`

### Events Emitted by Server (Client Listens)

* **`device_command`**: Sent from the server to the ESP32 when the `POST /device/command` API is triggered.
* **Payload:** `{ "action": "...", "req_id": "uuid" }`



### Events Emitted by Client/Device (Server Listens)

* **`sensor_data`**: Sent by the ESP32 to upload sensor logs.
* *(Currently just returns the data; history logging is marked as a TODO in the code).*


* **`device_response`**: MUST be sent by the ESP32 immediately after receiving a `device_command` to acknowledge execution. The backend REST API blocks until this is received.
* **Expected Payload:**
```json
{
  "req_id": "<uuid_matching_the_device_command>",
  "status": "success",
  "...": "..."
}

```





---

## 🗄️ Database Schema Summary (SQLite)

The database consists of 3 tables:

1. **`users`**
* `id` (PK), `name`, `email` (Unique), `password`, `created_at`, `updated_at`


2. **`plants`** (Global Plant Dictionary)
* `plant_id` (PK), `scientific_name`, `common_name`, `max_height`, `light_requirements`, `soil_ph_max`, `soil_ph_min`, `water_needed`, `optimum_soil_moisture_pct`, `critical_drought_pct`, `h_soil`, `l_soil`, `h_temp`, `l_temp`, `h_humi`, `l_humi`, `sensor_check_interval_hrs`.


3. **`user_plants`** (Many-to-Many mapping)
* `user_id` (FK), `plant_id` (FK), `growth_stage`