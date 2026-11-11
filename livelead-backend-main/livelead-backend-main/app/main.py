import eventlet
eventlet.monkey_patch()
import os
import sqlite3
from flask import Flask, g, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from flask_socketio import ConnectionRefusedError
from flask_jwt_extended import decode_token
from flask_cors import CORS
import uuid
import os
from google import genai
import json
from flask import Flask, g, request, send_from_directory

# ---------------------------------------------------------
# File Storage Configuration
# ---------------------------------------------------------
# Get the absolute path of the directory this script is in
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
LOGS_DIR = os.path.join(BASE_DIR, "device_logs")

# Ensure the directory exists
os.makedirs(LOGS_DIR, exist_ok=True)
app = Flask(__name__)
CORS(app)

socketio = SocketIO(app)

# JWT Configuration
app.config["JWT_SECRET_KEY"] = "super-secret-demo-key"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False
app.config["JWT_COOKIE_CSRF_PROTECT"] = False
jwt = JWTManager(app)

def ai(input):
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )

    tools = [
        {
            'type': 'google_search',
        },
    ]

    generation_config = {
        'max_output_tokens': 65536,
        'thinking_level': 'medium',
    }

    interaction = client.interactions.create(
        model='models/gemini-3.8-flash',
        input="""INSERT_INPUT_HERE""",
        tools=tools,
        generation_config=generation_config,
    )

    return interaction.steps[-1]

# ---------------------------------------------------------
# Database Driver
# ---------------------------------------------------------
DATABASE = "./app.db"
class DataBase:

    def get_db(self):
        db = getattr(g, "_database", None)
        if db is None:
            # Ensure instance directory exists
            os.makedirs(os.path.dirname(DATABASE), exist_ok=True)
            db = g._database = sqlite3.connect(DATABASE)
            # Allow column access by key name: row["password"]
            db.row_factory = sqlite3.Row
        return db

    def init_table(self):
        """Creates table if it doesn't exist yet."""
        with app.app_context():
            db = self.get_db()
            db.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL
                )
            """)
            db.commit()

    def query(self, query, args=(), one=False):
        cur = self.get_db().execute(query, args)
        rv = cur.fetchall()
        cur.close()
        return (rv[0] if rv else None) if one else rv

    def execute(self, sql, args=()):
        db = self.get_db()
        cur = db.cursor()
        cur.execute(sql, args)
        db.commit()
        last_id = cur.lastrowid
        cur.close()
        return last_id
db = DataBase()
db.init_table()

# ---------------------------------------------------------
# API Routes
# ---------------------------------------------------------

# POST /user/signup {name, email, password}
@app.route("/user/signup", methods=["POST"])
def handle_signup():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return {"msg": "Email and password are required"}, 400

    # Check if email is already taken
    user = db.query(
        "SELECT * FROM users WHERE email = ?",
        (email,),
        one=True,
    )
    if user:
        return {"msg": "Email is already in use"}, 400

    # Insert user
    user_id = db.execute(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        (name, email, password),
    )

    access_token = create_access_token(identity=str(user_id))

    return {
        "msg": "Signup successful",
        "data": {
            "userid": user_id,
            "token": access_token,
        },
    }, 201


# POST /user/login {email, password}
@app.route("/user/login", methods=["POST"])
def handle_login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return {"msg": "Email and password are required"}, 400

    user = db.query("SELECT id, password FROM users WHERE email = ?", (email,), one=True)
    if not user:
        return {"msg": "There is no user associated to this email"}, 401

    if password == user["password"]:
        access_token = create_access_token(identity=str(user["id"]))
        return {
            "msg": "Login successful",
            "data": {
                "userid": user["id"],
                "token": access_token,
            },
        }, 200

    return {"msg": "Invalid credentials"}, 401

# GET /plant
@app.route("/plant", methods=["GET"])
def handle_get_all_plants():
    plants = db.query("SELECT * FROM plants", one=False)

    if not plants:
        return {"msg": "No plants found", "data": []}, 200

    # Convert sqlite3.Row objects to standard Python dicts for JSON serialization
    plants_list = [dict(row) for row in plants]
    return {"data": plants_list}, 200


# GET /plant/<int:id>
@app.route("/plant/<int:id>", methods=["GET"])
def handle_get_plant_by_id(id):
    plant = db.query("SELECT * FROM plants WHERE plant_id = ?", (id,), one=True)

    if not plant:
        return {"msg": f"Plant with ID {id} not found"}, 404

    return {"data": plant}, 200

# POST /plant/add {plant_id, growth_stage (optional)}
@app.route("/plant/add", methods=["POST"])
@jwt_required()
def handle_add_plant():
  user_id = get_jwt_identity()
  data = request.get_json(silent=True) or {}
  plant_id = data.get("plant_id")
  # Default to 'seedling' or 'mature' if not provided by the user
  growth_stage = (data.get("growth_stage") or "seedling").strip()

  if not plant_id:
    return {"msg": "plant_id is required"}, 400

  # 1. Verify plant exists
  plant = db.query(
      "SELECT * FROM plants WHERE plant_id = ?", (plant_id,), one=True
  )
  if not plant:
    return {"msg": f"Plant with ID {plant_id} not found"}, 404

  # 2. Insert into user_plants with growth_stage
  try:
    db.execute(
        """
            INSERT INTO user_plants (user_id, plant_id, growth_stage)
            VALUES (?, ?, ?)
            """,
        (user_id, plant_id, growth_stage),
    )
  except Exception as e:
    return {"msg": f"Database error: {str(e)}"}, 400

  return {
      "msg": f"Plant id {plant_id} added to user {user_id} list",
      "data": {
          "user_id": user_id,
          "plant_id": plant_id,
          "growth_stage": growth_stage,
      },
  }, 200

# GET /plant/my
@app.route("/plant/my", methods=["GET"])
@jwt_required()
def handle_get_user_plants():
  user_id = get_jwt_identity()

  query = """
        SELECT 
            up.plant_id,
            up.growth_stage,
            p.scientific_name,
            p.common_name,
            p.light_requirements,
            p.water_needed,
            p.optimum_soil_moisture_pct,
            p.critical_drought_pct
        FROM user_plants up
        JOIN plants p ON up.plant_id = p.plant_id
        WHERE up.user_id = ?
    """

  user_plants = db.query(query, (user_id,), one=False)

  if not user_plants:
    return {"msg": "No plants found for this user", "data": []}, 200

  # Convert sqlite3.Row items to dicts
  result = [dict(row) for row in user_plants]
  return {"data": result}, 200

# ---------------------------------------------------------
# Teardown
# ---------------------------------------------------------
@app.teardown_appcontext
def close_connection(exception):
    database = getattr(g, "_database", None)
    if database is not None:
        database.close()
# ---------------------------------------------------------
# Tracking Dictionaries for WebSockets
# ---------------------------------------------------------
# Track users and their assigned rooms
sid_to_user = {} 

# Track pending responses
pending_responses = {}

# Track file chunks mapping: "socket_id + filename" -> "unique_filename"
active_file_transfers = {}

# NEW: Track the latest generated log file URL per user
user_latest_file_url = {}

@app.route('/')
def index():
    return {"msg": "hello, World!"}, 200

# ---------------------------------------------------------
# WebSocket / SocketIO Events
# ---------------------------------------------------------
@socketio.on('connect')
def handle_connect():
    token = request.args.get('token')
    if not token:
        return False

    try:
        decoded_token = decode_token(token)
        user_id = decoded_token["sub"]
        
        room_name = f"user_room_{user_id}"
        join_room(room_name)
        
        # Link the socket session ID to the User ID so we know who is sending what
        sid_to_user[request.sid] = user_id
        print(f"Device connected for User ID: {user_id}")
        
    except Exception as e:
        print(f"WebSocket Auth failed: {e}")
        return False

@socketio.on('disconnect')
def handle_disconnect():
    # Cleanup dictionary on disconnect
    sid_to_user.pop(request.sid, None)

@socketio.on('sensor_data')
def handle_sensor_data(data):
    return data

@socketio.on('device_response')
def handle_device_response(data):
    req_id = data.get('req_id')
    if req_id and req_id in pending_responses:
        pending_responses[req_id] = data


# Create a directory to store uploaded logs if it doesn't exist
LOGS_DIR = os.path.join(app.root_path, "device_logs")
os.makedirs(LOGS_DIR, exist_ok=True)

@socketio.on('log_chunk')
def handle_log_chunk(data):
    """ Receives incoming file chunks from the ESP32 and appends them to a UNIQUE file """
    filename = data.get('filename')
    chunk = data.get('chunk')
    sid = request.sid
    
    if filename and chunk:
        safe_filename = os.path.basename(filename)
        transfer_key = f"{sid}_{safe_filename}"
        
        # If this is the first chunk of a new file, generate a unique filename
        if transfer_key not in active_file_transfers:
            unique_name = f"{uuid.uuid4().hex[:8]}_{safe_filename}"
            active_file_transfers[transfer_key] = unique_name
            
        unique_name = active_file_transfers[transfer_key]
        
        # IMPORTANT: Use LOGS_DIR here
        save_path = os.path.join(LOGS_DIR, unique_name)
        
        # Append chunk to file
        with open(save_path, "a") as f:
            f.write(chunk)

@socketio.on('log_done')
def handle_log_done(data):
    """ Triggered when the ESP32 finishes sending the file """
    filename = data.get('filename')
    sid = request.sid
    safe_filename = os.path.basename(filename) if filename else "unknown_file"
    transfer_key = f"{sid}_{safe_filename}"
    
    unique_name = active_file_transfers.pop(transfer_key, None)
    
    if unique_name:
        print(f"Successfully received full file: {unique_name}")
        download_url = f"/download/logs/{unique_name}"
        
        user_id = sid_to_user.get(sid)
        if user_id:
            # ---> NEW: Save the URL so /device/command can access it
            user_latest_file_url[user_id] = download_url
            
            room_name = f"user_room_{user_id}"
            socketio.emit('log_ready', {
                'msg': 'Log file successfully uploaded and ready for download.',
                'original_filename': safe_filename,
                'url': download_url
            }, room=room_name)

# ---------------------------------------------------------
# REST API Routes
# ---------------------------------------------------------
@app.route('/download/logs/<path:filename>', methods=['GET'])
def download_log_file(filename):
    """ Serve the log file as an attachment to be downloaded """
    safe_filename = os.path.basename(filename)
    
    # IMPORTANT: Use LOGS_DIR here to ensure it matches where it was saved
    return send_from_directory(LOGS_DIR, safe_filename, as_attachment=True)

# GET /device/connected
@app.route('/device/connected', methods=['GET'])
@jwt_required()
def handle_get_connected_devices():
    # get_jwt_identity() returns a string because of create_access_token(identity=str(user_id))
    user_id = str(get_jwt_identity())
    
    # Find all socket IDs (devices) associated with this user_id
    user_devices = []
    for sid, uid in sid_to_user.items():
        if str(uid) == user_id:
            user_devices.append(sid)
            
    return {
        "msg": "Connected devices retrieved successfully",
        "data": {
            "user_id": user_id,
            "connected_count": len(user_devices),
            "active_sessions": user_devices  # Returns a list of active Socket.IO session IDs
        }
    }, 200

@app.route('/device/command', methods=['POST'])
@jwt_required()
def send_command_to_device():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    action = data.get("action")
    duration = data.get("duration")
    plant_data = data.get("data")

    if not action:
        return {"msg": "Action is required"}, 400

    room_name = f"user_room_{user_id}"
    req_id = str(uuid.uuid4())
    pending_responses[req_id] = None
    
    # List of actions that expect a file upload response
    file_upload_actions = ['push_sensor_log', 'push_watering_log']

    # Clear any previously generated URL for this user if expecting a file
    if action in file_upload_actions:
        user_latest_file_url.pop(user_id, None)

    payload = {
        'action': action,
        'req_id': req_id,
        'duration': duration,
        'data': plant_data
    }
    socketio.emit('device_command', payload, room=room_name)

    # Increased timeout to 10s to allow time for the file transfer to complete
    timeout = 10.0  
    elapsed = 0.0
    sleep_interval = 0.1

    device_reply = None
    file_url = None

    while elapsed < timeout:
        socketio.sleep(sleep_interval)
        elapsed += sleep_interval
        
        # 1. Check if device acknowledged the command
        if req_id in pending_responses and pending_responses[req_id] is not None:
            device_reply = pending_responses[req_id]
            
        # 2. If action requires a file, wait until the file is fully uploaded
        if action in file_upload_actions:
            file_url = user_latest_file_url.get(user_id)
            if device_reply and file_url:
                break # We have both!
        else:
            if device_reply:
                break # Just waiting for command acknowledgment

    # Cleanup
    device_reply = pending_responses.pop(req_id, device_reply)

    if device_reply is None:
        return {"msg": "Device timeout. No response received."}, 504
    
    response_payload = {
        "msg": f"Command '{action}' executed successfully",
        "device_response": device_reply
    }
    
    # Inject the URL into the final response for file-related actions
    if action in file_upload_actions:
        if file_url:
            response_payload["csv_url"] = file_url
        else:
            response_payload["msg"] = f"Command '{action}' executed, but file upload timed out."
            response_payload["csv_url"] = None

    return response_payload, 200

## ---------
# AI
## ---------
def analyze_plant_with_gemini(image_bytes, mime_type, sensor_data):
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    
    # 1. Read the system prompt from the file
    try:
        with open('photo_prompt.txt', 'r', encoding='utf-8') as f:
            system_prompt = f.read()
    except FileNotFoundError:
        raise Exception("photo_prompt.txt file not found on the server.")

    # 2. Format the live sensor data to append to the prompt
    # If a sensor reading is missing (e.g. timeout), it defaults to 'Unavailable'
    sensor_context = f"""
    \n\n=== CURRENT SENSOR READINGS ===
    Temperature: {sensor_data.get('temp', 'Unavailable')} °C
    Air Humidity: {sensor_data.get('humi', 'Unavailable')} %RH
    Light Intensity: {sensor_data.get('lamp', 'Unavailable')}
    Soil Moisture: {sensor_data.get('soil', 'Unavailable')} %
    Water Tank Level: {sensor_data.get('tank', 'Unavailable')} %
    ===============================
    """
    
    full_prompt = system_prompt + sensor_context
    
    # 3. Prepare the image part for the API
    image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
    
    # 4. Call the model (using gemini-2.5-flash or gemini-2.0-flash for multimodal tasks)
    response = client.models.generate_content(
        model='gemini-2.5-flash', 
        contents=[full_prompt, image_part],
        config=types.GenerateContentConfig(
            response_mime_type="application/json", # Forces strict JSON output
            temperature=0.2 # Lower temperature for analytical consistency
        )
    )
    
    return response.text

# POST /plant/analyze (Requires multipart/form-data with 'image' file)
@app.route('/plant/analyze', methods=['POST'])
@jwt_required()
def handle_plant_analysis():
    user_id = get_jwt_identity()

    # 1. Retrieve the image from the request
    if 'image' not in request.files:
        return {"msg": "No image file provided. Please upload an image using the 'image' key."}, 400
    
    file = request.files['image']
    if file.filename == '':
        return {"msg": "Empty file provided."}, 400

    image_bytes = file.read()
    mime_type = file.mimetype or "image/jpeg"

    # 2. Request real-time sensor data from the ESP32 via WebSocket
    room_name = f"user_room_{user_id}"
    req_id = str(uuid.uuid4())
    pending_responses[req_id] = None
    
    # Emit the specific action requested
    socketio.emit('device_command', {
        'action': 'push_sensor_val',
        'req_id': req_id
    }, room=room_name)

    # 3. Wait for the device to respond (Timeout: 5 seconds)
    timeout = 5.0  
    elapsed = 0.0
    sleep_interval = 0.1

    while pending_responses[req_id] is None and elapsed < timeout:
        socketio.sleep(sleep_interval)
        elapsed += sleep_interval

    # Fetch the response, default to an empty dict if the device timed out/offline
    device_reply = pending_responses.pop(req_id, None)
    sensor_data = device_reply if device_reply else {}

    # 4. Process with Gemini AI
    try:
        ai_response_text = analyze_plant_with_gemini(image_bytes, mime_type, sensor_data)
        
        # Parse the JSON string returned by Gemini into a Python dictionary
        analysis_data = json.loads(ai_response_text)
        
        return {
            "msg": "Plant analysis complete",
            "device_status": "online" if device_reply else "timeout/offline",
            "sensor_data_used": sensor_data,
            "analysis": analysis_data
        }, 200
        
    except json.JSONDecodeError:
        return {"msg": "AI returned malformed JSON."}, 500
    except Exception as e:
        print(f"Gemini Analysis Error: {e}")
        return {"msg": "Failed to analyze plant", "error": str(e)}, 500

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)