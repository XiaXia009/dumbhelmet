from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 開放 CORS，允許所有來源

@app.route('/')
def index():
    return jsonify({"message": "This is backend server"})
    # return template('index.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if email == "admin@gmail.com" and password == "admin":
        return jsonify({"token": "mock-token"})
    else:
        return jsonify({"detail": "錯誤的密碼或電子郵件"}), 401

@app.route('/uwb_data', methods=['POST'])
def uwb_data():
    data = request.get_json()
    user_id = data.get('user_id')
    x = data.get('x')
    y = data.get('y')

    return jsonify({"message": "UWB data received", "data": data})

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

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
