from flask import Flask, jsonify, request
from DB_Controller import DBController

app = Flask(__name__)
db_controller = DBController()

@app.route('/')
def index():
    return 'Welcome to Flask SQLite Example!'

@app.route('/add_worker', methods=['POST'])
def add_worker():
    data = request.json
    name = data.get('name')
    blood_type = data.get('blood_type')
    uwb_id = data.get('uwb_id')

    if not name or not blood_type or not uwb_id:
        return jsonify({"error": "Name, blood type, and UWB ID are required!"}), 400

    db_controller.add_worker(name, blood_type, uwb_id)
    return jsonify({"message": "Worker added successfully!"}), 201

@app.route('/add_uwb_hardware', methods=['POST'])
def add_uwb_hardware():
    data = request.json
    uwb_id = data.get('uwb_id')
    uwb_uuid = data.get('uwb_uuid')

    if not uwb_id or not uwb_uuid:
        return jsonify({"error": "UWB ID and UWB UUID are required!"}), 400

    db_controller.add_uwb_hardware(uwb_id, uwb_uuid)
    return jsonify({"message": "UWB hardware added successfully!"}), 201

@app.route('/add_uwb_position', methods=['POST'])
def add_uwb_position():
    data = request.json
    uwb_uuid = data.get('uwb_uuid')
    time = data.get('time')
    x = data.get('x')
    y = data.get('y')

    if not uwb_uuid or not time or not x or not y:
        return jsonify({"error": "UWB UUID, time, and coordinates are required!"}), 400

    db_controller.add_uwb_position(uwb_uuid, time, x, y)
    return jsonify({"message": "UWB position added successfully!"}), 201

@app.route('/workers', methods=['GET'])
def get_workers():
    workers = db_controller.get_workers()
    return jsonify(workers)

@app.route('/uwb_hardware', methods=['GET'])
def get_uwb_hardware():
    hardware = db_controller.get_uwb_hardware()
    return jsonify(hardware)

@app.route('/uwb_positions', methods=['GET'])
def get_uwb_positions():
    positions = db_controller.get_uwb_positions()
    return jsonify(positions)

if __name__ == '__main__':
    db_controller.init_db()  # 初始化資料庫
    app.run(debug=True)
