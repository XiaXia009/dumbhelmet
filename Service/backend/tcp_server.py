import socket
import threading
import time

connected_ips = []  # 用來儲存已連接的 IP 地址
connected_clients = {}  # 用來儲存已連接的客戶端 conn 物件
connected_lock = threading.Lock()

def find_ip_position(ip):
    with connected_lock:
        if ip in connected_ips:
            return connected_ips.index(ip)  # 返回位置，從 0 開始
        else:
            return -1  # 如果找不到該 IP，返回 -1

def handle_message(msg, ip_address):
    try:
        if msg == "/id":
            return str(find_ip_position(ip_address))
        else:
            return "Invalid message format."
    except Exception as e:
        return f"Error processing message: {e}"

def handle_client(conn, addr):
    ip_address = addr[0]

    with connected_lock:
        if ip_address not in connected_ips:
            connected_ips.append(ip_address)
            connected_clients[ip_address] = conn  # 儲存每個 IP 對應的 conn 物件
            print(f'[TCP] New IP connected: {ip_address}')
        print(f'[TCP] Current connected IPs: {connected_ips}')

    try:
        while True:
            data = conn.recv(1024)
            if not data:
                break
            
            msg = data.decode().strip()
            print(f'[TCP] Got: {msg}')
            
            response = handle_message(msg, ip_address)
            conn.sendall(response.encode())  # 回傳處理結果

    except Exception as e:
        print(f'[TCP] Error: {e}')
    finally:
        conn.close()
        with connected_lock:
            del connected_clients[ip_address]  # 斷開連線時移除客戶端
            connected_ips.remove(ip_address)  # 斷開連線時移除 IP 地址

def wait_for_three_ips():
    
    print("[TCP] Waiting for 3 IPs to connect")
    while True:
        with connected_lock:
            if len(connected_ips) >= 3:
                break
        time.sleep(0.5)
    print("[TCP] 3 anchors connected. 測定距離")

    send_message_to_ip(0, "tag")
    send_message_to_ip(1, "anchor")
    send_message_to_ip(2, "anchor")

    while True:
        with connected_lock:
            response = connected_clients[connected_ips[0]].recv(1024).decode().strip()
            if "tag" in response:
                position_data = parse_position_data(response)
                print(f"[TCP] Anchor 0 is now tagged with position: {position_data}")
                break
        time.sleep(0.5)

    send_message_to_ip(0, "anchor")
    send_message_to_ip(1, "tag")
    send_message_to_ip(2, "anchor")

    # 等待 anchor 1 回傳 "tag" 並接收位置資訊
    while True:
        with connected_lock:
            response = connected_clients[connected_ips[1]].recv(1024).decode().strip()
            if "tag" in response:
                position_data = parse_position_data(response)
                print(f"[TCP] Anchor 1 is now tagged with position: {position_data}")
                break
        time.sleep(0.5)

    send_message_to_ip(0, "anchor")
    send_message_to_ip(1, "anchor")
    send_message_to_ip(2, "tag")

    # 等待 anchor 2 回傳 "tag" 並接收位置資訊
    while True:
        with connected_lock:
            response = connected_clients[connected_ips[2]].recv(1024).decode().strip()
            if "tag" in response:
                position_data = parse_position_data(response)
                print(f"[TCP] Anchor 2 is now tagged with position: {position_data}")
                break
        time.sleep(0.5)

    # 假設的解析位置資訊的函式
    def parse_position_data(response):
        # 假設回應資料的格式是 "tag, x=10, y=20, z=30"
        # 這裡可以根據具體的資料格式進行解析
        position_info = {}
        parts = response.split(", ")
        for part in parts:
            key, value = part.split("=")
            position_info[key] = int(value)
        return position_info

def send_message_to_ip(index, message):
    with connected_lock:
        if 0 <= index < len(connected_ips):
            ip = connected_ips[index]  # 根據索引取得 IP 地址
            if ip in connected_clients:
                try:
                    print(f'[MSG INFO] Sending message to {ip}')
                    connected_clients[ip].sendall(message.encode())  # 發送訊息
                except Exception as e:
                    print(f'[MSG ERROR] Error sending to {ip}: {e}')
            else:
                print(f'[MSG ERROR] No client connection for {ip}')
        else:
            print(f'[MSG ERROR] Invalid index {index}.')

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind(('0.0.0.0', 8888))
    s.listen()
    print('[TCP] Listening...')


    # 開新執行緒來等待三台機器
    waiter_thread = threading.Thread(target=wait_for_three_ips)
    waiter_thread.start()

    # 主動發送訊息範例
    send_message_to_ip(0, "Hello from server!")  # 替換成你想發送訊息的 IP 地址

    while True:
        conn, addr = s.accept()
        client_thread = threading.Thread(target=handle_client, args=(conn, addr))
        client_thread.start()
