from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from flasgger import Swagger  # 新增
from sqlite_linker import SQLiteLinker
from influx_linker import Influxlinker
import time

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
swagger = Swagger(app)  # 新增

sqlite_linker = SQLiteLinker()
influx_linker = Influxlinker()

@app.route('/')
def index():
    return 'Welcome to Flask SQLite + InfluxDB Example!'


@app.route('/get_staffs', methods=['GET'])
def get_staffs():
    rows = sqlite_linker.get_staffs()
    staffs = [
        {
            'id': row[0],
            'name': row[1],
            'role': row[2],
            'department': row[3],
            'phone': row[4],
            'status': row[5],
            'bloodType': row[6],
        }
        for row in rows
    ]
    return jsonify(staffs)

@app.route('/get_helmets', methods=['GET'])
def get_helmets():
    helmets = sqlite_linker.get_helmets()
    helmet_list = [
        {
            'staffId': row[0],
            'staffName': row[1],
            'imei': row[2],
            'helmetPhone': row[3],
            'helmetCharge': row[4],
        }
        for row in helmets
    ]
    return jsonify(helmet_list)

@app.route('/get_unbound_staffs', methods=['GET'])
def get_unbound_staffs():
    rows = sqlite_linker.get_unbound_staffs()
    staffs = [
        {
            'id': row[0],
            'name': row[1],
            'role': row[2],
            'department': row[3],
            'phone': row[4],
            'status': row[5],
            'bloodType': row[6],
        }
        for row in rows
    ]
    return jsonify(staffs)

@app.route('/add_staff', methods=['POST'])
def add_staff():
    data = request.json
    name = data.get('name')
    position = data.get('position')
    department = data.get('department')
    phone = data.get('phone')
    status = data.get('status')
    blood = data.get('blood')

    if not all([name, position, department, phone, status, blood]):
        return jsonify({"error": "All fields are required!"}), 400

    staff_id = sqlite_linker.add_staff(name, position, department, phone, status, blood)
    return jsonify({"message": "Staff added successfully!", "staff_id": staff_id}), 201

@app.route('/add_helmet', methods=['POST'])
def add_helmet():
    data = request.json
    staff_id = data.get('staff_id')
    imei = data.get('imei')

    if not all([staff_id, imei]):
        return jsonify({"error": "Staff ID and IMEI are required!"}), 400

    sqlite_linker.add_helmet(staff_id, imei)
    return jsonify({"message": "Helmet added successfully!"}), 201

@app.route('/update_helmet_phone', methods=['POST'])
def update_helmet_phone():
    data = request.json
    imei = data.get('imei')
    helmet_phone = data.get('helmet_phone')

    if not imei or not helmet_phone:
        return jsonify({"error": "imei and helmet_phone are required!"}), 400

    success = sqlite_linker.update_helmet_phone(imei, helmet_phone)
    if success:
        return jsonify({"message": "Helmet phone updated successfully!"}), 200
    else:
        return jsonify({"error": "Failed to update helmet phone. Check if IMEI exists."}), 400

@app.route('/update_helmet_charge', methods=['POST'])
def update_helmet_charge():
    data = request.json
    imei = data.get('imei')
    charge = data.get('charge')

    if not imei or charge is None:
        return jsonify({"error": "imei and charge are required!"}), 400

    success = sqlite_linker.update_helmet_charge(imei, charge)
    if success:
        return jsonify({"message": "Helmet charge updated successfully!"}), 200
    else:
        return jsonify({"error": "Failed to update helmet charge. Check if IMEI exists."}), 400

@app.route('/add_uwb_position_influx', methods=['POST'])
def add_uwb_position_influx():
    data = request.json
    staff_id = data.get('staff_id')
    timestamp = data.get('time')
    x = data.get('x')   
    y = data.get('y')

    if not staff_id or not timestamp or x is None or y is None:
        return jsonify({"error": "staff_id, time, and coordinates are required!"}), 400

    influx_linker.write_position(staff_id, x, y, timestamp)
    return jsonify({"message": "UWB position added to InfluxDB successfully!"}), 201

@app.route('/uwb_positions_influx', methods=['GET'])
def get_uwb_positions_influx():
    staff_id = request.args.get('staff_id')
    start = request.args.get('start')
    end = request.args.get('end')

    if not staff_id or not start or not end:
        return jsonify({"error": "staff_id, start, and end are required!"}), 400

    data = influx_linker.query_positions(staff_id=staff_id, start_date=start, end_date=end)
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

    activity = broadcast_message(data)

    return jsonify({"status": "OK", "activity": activity}), 200

def broadcast_message(activity_data):
    ts = activity_data.get("time")
    if not ts:
        ts = int(time.time() * 1000)  # 預設當前毫秒
    else:
        ts = int(ts)

    # 轉成秒
    dt = datetime.fromtimestamp(ts / 1000)
    # 格式化
    formatted_time = dt.strftime("%m/%d %p%I:%M").replace("AM", "上午").replace("PM", "下午")

    activity = {
        "message": activity_data.get("message", "未知訊息"),
        "time": formatted_time,
        "status": activity_data.get("status"),
        "icon": activity_data.get("icon"),
    }

    emit('message', activity, broadcast=True, namespace='/')
    return activity

@socketio.on('connect')
def handle_connect():
    broadcast_message({
        "message": "Server is running up.",
        "status": "success",
        "icon": "CloudCheck"
    })
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    broadcast_message({
        "type": "disconnection",
        "message": "A client has disconnected.",
        "status": "info",
        "icon": "Info"
    })
    print('Client disconnected')

if __name__ == '__main__':
    sqlite_linker.init_db()
    # app.run(host='127.0.0.1', port=5000, debug=True)  # 註解掉原本的
    socketio.run(app, host='127.0.0.1', port=5000, debug=True)