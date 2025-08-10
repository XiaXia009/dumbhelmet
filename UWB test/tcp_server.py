import socket
import threading
import time
# 幹幹幹幹幹幹幹幹幹
connected_ips = []
connected_clients = {}
data_events = {}
last_payload = {}
connected_lock = threading.Lock()

def send_message_to_ip(index, message):
    with connected_lock:
        if 0 <= index < len(connected_ips):
            ip = connected_ips[index]
            conn = connected_clients.get(ip)
        else:
            print(f'[MSG ERROR] Invalid index {index}.')
            return
    if conn is None:
        print(f'[MSG ERROR] No client connection for index {index}')
        return
    try:
        print(f'[MSG INFO] Sending "{message}" to {ip}')
        conn.sendall(message.encode())
    except Exception as e:
        print(f'[MSG ERROR] Error sending to {ip}: {e}')

def mode_controller(UWB_1, UWB_2, UWB_3):
    send_message_to_ip(0, UWB_1)
    send_message_to_ip(1, UWB_2)
    send_message_to_ip(2, UWB_3)

def find_ip_position(ip):
    with connected_lock:
        try:
            return connected_ips.index(ip)
        except ValueError:
            return -1

def handle_message(msg, ip_address):
    if msg == "/id":
        return str(find_ip_position(ip_address))
    else:
        return "Invalid message format."

def handle_client(conn, addr):
    ip_address = addr[0]

    # 幹幹幹幹幹幹幹幹幹幹
    with connected_lock:
        if ip_address not in connected_ips:
            connected_ips.append(ip_address)
            connected_clients[ip_address] = conn
            data_events[ip_address] = threading.Event()
            print(f'[TCP] New IP connected: {ip_address}')
        print(f'[TCP] Current connected IPs: {connected_ips}')

    try:
        while True:
            data = conn.recv(4096)
            if not data:
                break
            msg = data.decode(errors="ignore").strip()
            print(f'[TCP] Got from {ip_address}: {msg}')

            # command: /id, return int
            if msg == "/id":
                resp = handle_message(msg, ip_address)
                conn.sendall(resp.encode())
            else:
                # 視為該 ip 回傳位置資料
                with connected_lock:
                    last_payload[ip_address] = msg
                    ev = data_events.get(ip_address)
                if ev:
                    ev.set()  # 控制線程設定這輪資料
    except Exception as e:
        print(f'[TCP] Error: {e}')
    finally:
        with connected_lock:
            try:
                connected_ips.remove(ip_address)
            except ValueError:
                pass
            connected_clients.pop(ip_address, None)
            data_events.pop(ip_address, None)
            last_payload.pop(ip_address, None)
        try:
            conn.close()
        except:
            pass
        print(f'[TCP] Disconnected: {ip_address}')

def wait_for_three_ips():
    print("[TCP] Waiting for 3 IPs to connect")
    while True:
        with connected_lock:
            if len(connected_ips) >= 3:
                break
        time.sleep(0.2)
    print("[TCP] 3 anchors connected. 開始基站測距")

import subprocess

def run_phases():
    phases = [
        {"modes": ("tag", "anchor", "anchor"), "tag_index": 0, "pairs": ("an1", "an2")},  # tag0 => AB, AC
        {"modes": ("anchor", "tag", "anchor"), "tag_index": 1, "pairs": ("an0", "an2")},  # tag1 => AB, BC
        {"modes": ("anchor", "anchor", "tag"), "tag_index": 2, "pairs": ("an0", "an1")},  # tag2 => AC, BC
    ]

    # 存每個距離平均值
    avg_distances = {"AB": None, "AC": None, "BC": None}

    for i, ph in enumerate(phases, 1):
        with connected_lock:
            if len(connected_ips) < 3:
                print(f"[CTRL] Not enough clients for phase {i}, abort.")
                return
            tag_ip = connected_ips[ph["tag_index"]]
            ev = data_events.get(tag_ip)
            if ev is None:
                print(f"[CTRL] No event for {tag_ip}, abort.")
                return
            ev.clear()

        a, b, c = ph["modes"]
        print(f"[CTRL] Phase {i}: set modes {ph['modes']}, waiting data from index {ph['tag_index']} ({tag_ip})")
        mode_controller(a, b, c)

        ok = ev.wait(timeout=99999)
        if not ok:
            print(f"[CTRL] Phase {i}: timeout waiting data from {tag_ip}")
        else:
            with connected_lock:
                payload = last_payload.get(tag_ip, "")
            print(f"[CTRL] Phase {i}: received data from {tag_ip}: {payload}")

            # 計算平均值
            lines = payload.splitlines()
            distances = {pair: [] for pair in ph["pairs"]}
            for line in lines:
                for pair in ph["pairs"]:
                    if line.startswith(pair + ":"):
                        try:
                            val = float(line.split(":")[1].replace("m", "").strip())
                            distances[pair].append(val)
                        except:
                            pass

            for pair, vals in distances.items():
                if vals:
                    avg_val = sum(vals) / len(vals)
                    if pair == "an0" and ph["tag_index"] == 1:
                        avg_distances["AB"] = avg_val
                    elif pair == "an1" and ph["tag_index"] == 0:
                        avg_distances["AB"] = avg_val
                    elif pair == "an2" and ph["tag_index"] == 0:
                        avg_distances["AC"] = avg_val
                    elif pair == "an0" and ph["tag_index"] == 2:
                        avg_distances["AC"] = avg_val
                    elif pair == "an1" and ph["tag_index"] == 2:
                        avg_distances["BC"] = avg_val
                    elif pair == "an2" and ph["tag_index"] == 1:
                        avg_distances["BC"] = avg_val

    print("[CTRL] All phases done.")
    print("[CTRL] Average distances:", avg_distances)

    # 呼叫 app.pyw
    if all(v is not None for v in avg_distances.values()):
        cmd = [
            "python", "app.pyw",
            "-AB", f"{avg_distances['AB']:.2f}",
            "-AC", f"{avg_distances['AC']:.2f}",
            "-BC", f"{avg_distances['BC']:.2f}",
            "-center"
        ]
        print("[CTRL] Running:", " ".join(cmd))
        subprocess.Popen(cmd)


def controller_thread():
    wait_for_three_ips() #等待三個基站連線
    time.sleep(1.0) #三個線程會打架😡幹
    run_phases()

def main():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('0.0.0.0', 8888))
        s.listen()
        print('[TCP] Listening...')

        
        threading.Thread(target=controller_thread, daemon=True).start()

        while True:
            conn, addr = s.accept()
            threading.Thread(target=handle_client, args=(conn, addr), daemon=True).start()

if __name__ == "__main__":
    main()
