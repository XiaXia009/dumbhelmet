import serial
import matplotlib.pyplot as plt
import numpy as np

# === 參數 ===
anchor0 = np.array([1.85, 0.5])
anchor1 = np.array([0.10, 0.5])
d = np.linalg.norm(anchor1 - anchor0)
epsilon = 0.75  # 容忍度
history = []  # 軌跡紀錄

# === 圖形初始化 ===
plt.ion()
fig, ax = plt.subplots(figsize=(10, 10))
ax.set_aspect('equal')
plt.xlim(-1, 3)
plt.ylim(-1, 3)
plt.xlabel("X (m)")
plt.ylabel("Y (m)")
plt.title("UWB Tag Real-Time Position")
plt.grid(linewidth=1.5)

anchor0_dot, = ax.plot(*anchor0, 'bo', label='Anchor0', markersize=12)
anchor1_dot, = ax.plot(*anchor1, 'go', label='Anchor1', markersize=12)
tag_dot, = ax.plot([], [], 'ro', label='Tag', markersize=12)
trajectory_line, = ax.plot([], [], 'r--', linewidth=1.5, alpha=0.7, label='Trajectory')

circle0 = plt.Circle(anchor0, 0, color='blue', fill=False, linewidth=2.5)
circle1 = plt.Circle(anchor1, 0, color='green', fill=False, linewidth=2.5)
ax.add_patch(circle0)
ax.add_patch(circle1)

plt.legend()

# === 串口初始化 ===
ser = serial.Serial('COM7', 115200, timeout=1)

r0, r1 = None, None


def compute_tag_pos(r0, r1):
    if d > r0 + r1 + epsilon or d < abs(r0 - r1) - epsilon:
        print("⚠ 無交點")
        return None
    try:
        a = (r0**2 - r1**2 + d**2) / (2 * d)
        h = np.sqrt(max(r0**2 - a**2, 0))
        P2 = anchor0 + a * (anchor1 - anchor0) / d
        x3 = P2[0] + h * (anchor1[1] - anchor0[1]) / d
        y3 = P2[1] - h * (anchor1[0] - anchor0[0]) / d
        return np.array([x3, y3])
    except Exception as e:
        print(f"❌ 計算錯誤: {e}")
        return None


try:
    while True:
        line = ser.readline().decode(errors='ignore').strip()
        if not line:
            continue

        print(line)

        if line.startswith('an0:'):
            try:
                r0 = float(line.split(':')[1].replace('m', ''))
            except:
                r0 = None
        elif line.startswith('an1:'):
            try:
                r1 = float(line.split(':')[1].replace('m', ''))
            except:
                r1 = None

        if r0 is not None and r1 is not None:
            tag_pos = compute_tag_pos(r0, r1)

            # 更新圓半徑
            circle0.set_radius(r0)
            circle1.set_radius(r1)

            if tag_pos is not None:
                tag_dot.set_data([tag_pos[0]], [tag_pos[1]])

                # 更新軌跡
                history.append(tag_pos)
                history_arr = np.array(history)
                trajectory_line.set_data(history_arr[:, 0], history_arr[:, 1])

                # 動態縮放
                min_x, max_x = min(history_arr[:, 0].min(), -1), max(history_arr[:, 0].max(), 3)
                min_y, max_y = min(history_arr[:, 1].min(), -1), max(history_arr[:, 1].max(), 3)
                ax.set_xlim(min_x - 0.5, max_x + 0.5)
                ax.set_ylim(min_y - 0.5, max_y + 0.5)

            else:
                tag_dot.set_data([], [])  # 無交點不畫

            fig.canvas.draw()
            fig.canvas.flush_events()

except KeyboardInterrupt:
    print("\n👋 結束！")
    ser.close()
