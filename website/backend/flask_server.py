from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from flasgger import Swagger  # 新增
from sqlite_linker import SQLiteLinker
from influx_linker import Influxlinker

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
swagger = Swagger(app)  # 新增

sqlite_linker = SQLiteLinker()
influx_linker = Influxlinker()

@app.route('/')
def index():
    return 'Welcome to Flask SQLite + InfluxDB Example!'


@app.route('/add_worker', methods=['POST'])
def add_worker():
    data = request.json
    name = data.get('name')
    blood_type = data.get('blood_type')
    uwb_id = data.get('uwb_id')

    if not name or not blood_type or not uwb_id:
        return jsonify({"error": "Name, blood type, and UWB ID are required!"}), 400

    sqlite_linker.add_worker(name, blood_type, uwb_id)
    return jsonify({"message": "Worker added successfully!"}), 201


@app.route('/add_uwb_hardware', methods=['POST'])
def add_uwb_hardware():
    data = request.json
    uwb_id = data.get('uwb_id')
    uwb_uuid = data.get('uwb_uuid')

    if not uwb_id or not uwb_uuid:
        return jsonify({"error": "UWB ID and UWB UUID are required!"}), 400

    sqlite_linker.add_uwb_hardware(uwb_id, uwb_uuid)
    return jsonify({"message": "UWB hardware added successfully!"}), 201


@app.route('/add_uwb_position', methods=['POST'])
def add_uwb_position():
    data = request.json
    uwb_uuid = data.get('uwb_uuid')
    time = data.get('time')
    x = data.get('x')
    y = data.get('y')

    if not uwb_uuid or not time or x is None or y is None:
        return jsonify({"error": "UWB UUID, time, and coordinates are required!"}), 400

    sqlite_linker.add_uwb_position(uwb_uuid, time, x, y)
    return jsonify({"message": "UWB position added to SQLite successfully!"}), 201


@app.route('/add_uwb_position_influx', methods=['POST'])
def add_uwb_position_influx():
    data = request.json
    tag_id = data.get('tag_id')
    timestamp = data.get('time')
    x = data.get('x')   
    y = data.get('y')

    if not tag_id or not timestamp or x is None or y is None:
        return jsonify({"error": "tag_id, time, and coordinates are required!"}), 400

    influx_linker.write_position(tag_id, x, y, timestamp)
    return jsonify({"message": "UWB position added to InfluxDB successfully!"}), 201


@app.route('/workers', methods=['GET'])
def get_workers():
    workers = sqlite_linker.get_workers()
    return jsonify(workers)


@app.route('/uwb_hardware', methods=['GET'])
def get_uwb_hardware():
    hardware = sqlite_linker.get_uwb_hardware()
    return jsonify(hardware)


@app.route('/uwb_positions', methods=['GET'])
def get_uwb_positions():
    positions = sqlite_linker.get_uwb_positions()
    return jsonify(positions)


@app.route('/uwb_positions_influx', methods=['GET'])
def get_uwb_positions_influx():
    tag_id = request.args.get('tag_id')
    start = request.args.get('start')
    end = request.args.get('end')

    if not tag_id or not start or not end:
        return jsonify({"error": "tag_id, start, and end are required!"}), 400

    data = influx_linker.query_positions(tag_id=tag_id, start_date=start, end_date=end)
    return jsonify(data)

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if email == "admin@gmail.com" and password == "admin":
        return jsonify({"token": "mock-token"})
    else:
        return jsonify({"detail": "錯誤的密碼或電子郵件"}), 401

@app.route('/me', methods=['GET'])
def me():
    return jsonify({
        "id": "1",
        "name": "Admin",
        "email": "admin@gmail.com",
        "role": "admin",
        "department": "Safety Management",
        "phone": "+886 912 345 678",
        "createdAt": "2024-01-15"
    })

@app.route('/message', methods=['POST'])
def websocket_test():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data"}), 400

    import time
    activity = {
        "id": int(data.get("id", 0)) or int(time.time() * 1000),
        "type": data.get("type", "general_info"),
        "message": data.get("message", "未知訊息"),
        "time": data.get("time") or int(time.time() * 1000),
        "status": data.get("status", "info"),
        "icon": data.get("icon", "Info"),
    }

    emit('message', activity, broadcast=True, namespace='/')
    return jsonify({"status": "OK", "activity": activity}), 200

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    sqlite_linker.init_db()
    # app.run(host='127.0.0.1', port=5000, debug=True)  # 註解掉原本的
    socketio.run(app, host='127.0.0.1', port=5000, debug=True)