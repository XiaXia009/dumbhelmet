import socket
import threading

connected_ips = []  # 用來儲存已連接的 IP 地址

def find_ip_position(ip):
    if ip in connected_ips:
        return connected_ips.index(ip)  # 返回位置，從 0 開始
    else:
        return -1  # 如果找不到該 IP，返回 -1

def handle_message(msg, ip_address):
    try:
        # 檢查訊息是否為 "/id"
        if msg == "/id":
            find_ip_position(ip_address)
        else:
            return "Invalid message format."
    except Exception as e:
        return f"Error processing message: {e}"

def handle_client(conn, addr):
    ip_address = addr[0]
    
    # 如果 IP 不在列表中，則加入
    if ip_address not in connected_ips:
        connected_ips.append(ip_address)
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

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind(('0.0.0.0', 8888))
    s.listen()
    print('[TCP] Listening...')

    while True:
        conn, addr = s.accept()
        # 每個連接開啟一個新的執行緒來處理
        client_thread = threading.Thread(target=handle_client, args=(conn, addr))
        client_thread.start()