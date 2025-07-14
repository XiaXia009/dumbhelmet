import requests
import datetime
import random
import time

# Flask API 的網址
URL = 'http://127.0.0.1:5000/add_uwb_position_influx'

# 要傳的資料
payload = {
    "tag_id": "TAG123",
    "time": datetime.datetime.utcnow().isoformat() + "Z",  # 現在時間，UTC 格式
    "x": random.uniform(-100, 100),  # 隨機生成 x 座標
    "y": random.uniform(-100, 100)   # 隨機生成 y 座標
}

# 發送 POST 請求
while True:
    payload["time"] = datetime.datetime.utcnow().isoformat() + "Z"  # 更新時間
    payload["x"] = random.uniform(-100, 100)  # 更新 x 座標
    payload["y"] = random.uniform(-100, 100)  # 更新 y 座標
    response = requests.post(URL, json=payload)

    # 輸出結果
    print(f"Status Code: {response.status_code}")
    print("Response JSON:", response.json())
    time.sleep(5)  # 每5秒發送一次請求