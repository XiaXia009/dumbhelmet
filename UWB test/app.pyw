import numpy as np
import matplotlib.pyplot as plt
from tkinter import Tk, Label, Button, Entry, StringVar, Frame, IntVar, Checkbutton
from tkinter import messagebox, ttk
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib import rcParams
import argparse
import sys

parser = argparse.ArgumentParser(description="三角形座標繪製工具")
parser.add_argument("-AB", type=float, help="邊 AB 長度")
parser.add_argument("-AC", type=float, help="邊 AC 長度")
parser.add_argument("-BC", type=float, help="邊 BC 長度")
parser.add_argument("-center", action="store_true", help="啟用圖形置中顯示")
args = parser.parse_args()


rcParams['font.family'] = 'Microsoft YaHei'
rcParams['font.size'] = 12
rcParams['axes.titlesize'] = 14
rcParams['axes.labelsize'] = 12
rcParams['xtick.labelsize'] = 10
rcParams['ytick.labelsize'] = 10

# 全域變數儲存目前的三角形座標和視圖狀態

current_triangle = None
auto_center_mode = False

# 計算三個點的座標
def calculate_coordinates(dAB, dAC, dBC):
    if dAB + dAC <= dBC or dAB + dBC <= dAC or dAC + dBC <= dAB:
        raise ValueError("這些邊長無法構成有效的三角形，請檢查輸入的邊長。")
    
    A = np.array([0, 0])
    B = np.array([dAB, 0])
    xC = (dAC**2 - dBC**2 + dAB**2) / (2 * dAB)
    yC_squared = dAC**2 - xC**2
    if yC_squared < 0:
        raise ValueError("計算結果不符合三角形的條件，請檢查邊長輸入。")
    
    yC = np.sqrt(yC_squared)
    C = np.array([xC, yC])
    
    return A, B, C

# 繪製圖形
def plot_triangle(A, B, C, ax, use_auto_center=False):
    ax.clear()
    ax.set_facecolor('#f8f9fa')
    
    # 繪製三角形邊線
    ax.plot([A[0], B[0]], [A[1], B[1]], 'b-', linewidth=2.5, label='邊 AB')
    ax.plot([B[0], C[0]], [B[1], C[1]], 'r-', linewidth=2.5, label='邊 BC')
    ax.plot([C[0], A[0]], [C[1], A[1]], 'g-', linewidth=2.5, label='邊 CA')
    
    # 填充三角形
    ax.fill([A[0], B[0], C[0]], [A[1], B[1], C[1]], 'lightblue', alpha=0.3)
    
    # 標記頂點
    ax.plot(A[0], A[1], 'ko', markersize=8)
    ax.plot(B[0], B[1], 'ko', markersize=8)
    ax.plot(C[0], C[1], 'ko', markersize=8)
    
    # 添加頂點標籤
    ax.text(A[0]-0.5, A[1]-0.5, 'A', fontsize=14, fontweight='bold')
    ax.text(B[0]+0.3, B[1]-0.5, 'B', fontsize=14, fontweight='bold')
    ax.text(C[0]+0.3, C[1]+0.3, 'C', fontsize=14, fontweight='bold')
    
    # 設置座標軸範圍
    if use_auto_center:
        # 計算三角形的邊界
        x_coords = [A[0], B[0], C[0]]
        y_coords = [A[1], B[1], C[1]]
        
        x_min, x_max = min(x_coords), max(x_coords)
        y_min, y_max = min(y_coords), max(y_coords)
        
        # 計算中心點
        x_center = (x_min + x_max) / 2
        y_center = (y_min + y_max) / 2
        
        # 計算適當的顯示範圍（添加一些邊距）
        x_range = max(x_max - x_min, 1) * 1.3
        y_range = max(y_max - y_min, 1) * 1.3
        max_range = max(x_range, y_range)
        
        ax.set_xlim(x_center - max_range/2, x_center + max_range/2)
        ax.set_ylim(y_center - max_range/2, y_center + max_range/2)
    else:
        # 原來的顯示範圍設定
        max_coord = max(abs(A[0]), abs(A[1]), abs(B[0]), abs(B[1]), abs(C[0]), abs(C[1])) + 2
        ax.set_xlim(-max_coord, max_coord)
        ax.set_ylim(-max_coord, max_coord)
    
    ax.set_aspect('equal')
    
    # 添加網格和軸線
    ax.grid(True, alpha=0.3)
    ax.axhline(y=0, color='k', linewidth=0.5, alpha=0.5)
    ax.axvline(x=0, color='k', linewidth=0.5, alpha=0.5)
    
    # 設置標籤
    ax.set_xlabel('X 座標', fontsize=12, fontweight='bold')
    ax.set_ylabel('Y 座標', fontsize=12, fontweight='bold')
    title_suffix = " (置中顯示)" if use_auto_center else ""
    ax.set_title(f'基站位置{title_suffix}', fontsize=14, fontweight='bold', pad=20)
    
    # 添加圖例
    ax.legend(loc='upper right', fontsize=10)

# 翻轉圖形
def flip_triangle(A, B, C, flip_horizontal, flip_vertical):
    points = [A, B, C]
    flipped_points = []
    
    for point in points:
        x, y = point
        if flip_horizontal:
            x = -x
        if flip_vertical:
            y = -y
        flipped_points.append(np.array([x, y]))
    
    return flipped_points[0], flipped_points[1], flipped_points[2]

# 處理置中模式變更
def on_center_change():
    global auto_center_mode
    auto_center_mode = auto_center_checkbox.get()
    
    # 如果當前有三角形，立即重新繪製
    if current_triangle is not None:
        A, B, C = current_triangle
        plot_triangle(A, B, C, ax, use_auto_center=auto_center_mode)
        canvas.draw()

# 更新繪圖
def update_plot():
    global current_triangle
    try:
        dAB = float(entryAB.get())
        dAC = float(entryAC.get())
        dBC = float(entryBC.get())
        
        if dAB <= 0 or dAC <= 0 or dBC <= 0:
            raise ValueError("邊長必須為正數")
            
        A, B, C = calculate_coordinates(dAB, dAC, dBC)
        
        # 應用翻轉
        flip_h = flip_horizontal.get()
        flip_v = flip_vertical.get()
        
        if flip_h or flip_v:
            A, B, C = flip_triangle(A, B, C, flip_h, flip_v)
        
        # 儲存當前三角形座標
        current_triangle = (A, B, C)
        
        # 根據置中模式繪製
        plot_triangle(A, B, C, ax, use_auto_center=auto_center_mode)
        
        # 更新計算結果顯示
        area = 0.5 * abs((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]))
        perimeter = dAB + dAC + dBC
        
        result_text.set(f"周長: {perimeter:.2f}\n面積: {area:.2f}")
        
        canvas.draw()
    
    except ValueError as e:
        messagebox.showerror("輸入錯誤", str(e))
    except Exception as e:
        messagebox.showerror("計算錯誤", f"發生未知錯誤: {str(e)}")

# 清除功能
def clear_all():
    global current_triangle, auto_center_mode
    current_triangle = None
    auto_center_mode = False
    
    entryAB.delete(0, 'end')
    entryAC.delete(0, 'end')
    entryBC.delete(0, 'end')
    ax.clear()
    
    # 重置所有選項
    flip_horizontal.set(0)
    flip_vertical.set(0)
    auto_center_checkbox.set(0)
    
    # 重新初始化空的圖形
    ax.set_xlim(-10, 10)
    ax.set_ylim(-10, 10)
    ax.set_aspect('equal')
    ax.grid(True, alpha=0.2)
    ax.set_xlabel('X 座標', fontsize=12, fontweight='bold')
    ax.set_ylabel('Y 座標', fontsize=12, fontweight='bold')
    ax.set_title('基站位置', fontsize=14, fontweight='bold', pad=20)
    ax.set_facecolor('#f8f9fa')
    
    result_text.set("周長: --\n面積: --")
    canvas.draw()

# 當翻轉選項改變時自動更新
def on_flip_change():
    if entryAB.get() and entryAC.get() and entryBC.get():
        update_plot()

# 主視窗
root = Tk()
root.title("安全帽-基站群位置測試")
root.geometry("950x750")
root.config(bg="#ffffff")

# 設置樣式
style = ttk.Style()
style.theme_use('clam')

# 主容器
main_frame = Frame(root, bg="#ffffff")
main_frame.pack(fill='both', expand=True, padx=20, pady=20)

# 左側 - 圖形顯示區域
left_frame = Frame(main_frame, bg="#ffffff", relief='ridge', bd=2)
left_frame.pack(side='left', fill='both', expand=True, padx=(0, 20))

# 圖形標題
title_label = Label(left_frame, text="基站群位置測試", 
                   font=("Microsoft YaHei", 16, "bold"), bg="#ffffff", fg="#2c3e50")
title_label.pack(pady=(10, 20))

# 繪圖區域
fig, ax = plt.subplots(figsize=(6, 6))
fig.patch.set_facecolor('#ffffff')
canvas = FigureCanvasTkAgg(fig, master=left_frame)
canvas.get_tk_widget().pack(padx=20, pady=20)

# 右側 - 控制面板
right_frame = Frame(main_frame, bg="#f8f9fa", relief='ridge', bd=2, width=300)
right_frame.pack(side='right', fill='y', padx=(20, 0))
right_frame.pack_propagate(False)

# 輸入參數區域
input_frame = Frame(right_frame, bg="#f8f9fa")
input_frame.pack(padx=20, pady=20, fill='x')

# 邊長輸入
Label(input_frame, text="邊長數值", font=("Microsoft YaHei", 12, "bold"), 
      bg="#f8f9fa", fg="#34495e").pack(anchor='w', pady=(0, 15))

for i, (label_text, var_name) in enumerate([ 
    ("邊 AB 長度:", "entryAB"),
    ("邊 AC 長度:", "entryAC"), 
    ("邊 BC 長度:", "entryBC")
]):
    row_frame = Frame(input_frame, bg="#f8f9fa")
    row_frame.pack(fill='x', pady=5)
    
    Label(row_frame, text=label_text, font=("Microsoft YaHei", 10), 
          bg="#f8f9fa", width=12, anchor='w').pack(side='left')
    
    entry = Entry(row_frame, font=("Microsoft YaHei", 10), width=10, relief='solid', bd=1)
    entry.pack(side='right')
    globals()[var_name] = entry

# 翻轉控制區域
flip_frame = Frame(right_frame, bg="#f8f9fa")
flip_frame.pack(padx=20, pady=20, fill='x')

Label(flip_frame, text="圖形切換", font=("Microsoft YaHei", 12, "bold"), 
      bg="#f8f9fa", fg="#34495e").pack(anchor='w', pady=(0, 15))

flip_horizontal = IntVar()
flip_vertical = IntVar()
auto_center_checkbox = IntVar()

h_check = Checkbutton(flip_frame, text="水平翻轉", variable=flip_horizontal,
                     font=("Microsoft YaHei", 10), bg="#f8f9fa", command=on_flip_change,
                     activebackground="#f8f9fa")
h_check.pack(anchor='w', pady=5)

v_check = Checkbutton(flip_frame, text="垂直翻轉", variable=flip_vertical,
                     font=("Microsoft YaHei", 10), bg="#f8f9fa", command=on_flip_change,
                     activebackground="#f8f9fa")
v_check.pack(anchor='w', pady=5)

# 修改後的置中選項
center_check = Checkbutton(flip_frame, text="圖形置中", variable=auto_center_checkbox,
                          font=("Microsoft YaHei", 10), bg="#f8f9fa", command=on_center_change,
                          activebackground="#f8f9fa")
center_check.pack(anchor='w', pady=5)

# 按鈕區域
button_frame = Frame(right_frame, bg="#f8f9fa")
button_frame.pack(padx=20, pady=20, fill='x')

calculate_btn = Button(button_frame, text="繪製", 
                      font=("Microsoft YaHei", 13, "bold"), bg="#3498db", fg="white",
                      command=update_plot, height=2, relief='flat',
                      activebackground="#2980b9", activeforeground="white")
calculate_btn.pack(fill='x', pady=5)

clear_btn = Button(button_frame, text="清除", 
                  font=("Microsoft YaHei", 13, "bold"), bg="#e74c3c", fg="white",
                  height=2, relief='flat',
                  activebackground="#c0392b", activeforeground="white",
                  command=clear_all)
clear_btn.pack(fill='x', pady=5)

# 結果顯示區域
result_frame = Frame(right_frame, bg="#f8f9fa")
result_frame.pack(padx=20, pady=20, fill='x')

Label(result_frame, text="計算結果", font=("Microsoft YaHei", 12, "bold"), 
      bg="#f8f9fa", fg="#34495e").pack(anchor='w', pady=(0, 10))

result_text = StringVar()
result_text.set("周長: --\n面積: --")

result_display = Label(result_frame, textvariable=result_text, 
                      font=("Microsoft YaHei", 10), bg="#ffffff", 
                      relief='solid', bd=1, justify='left',
                      padx=10, pady=10)
result_display.pack(fill='x')

# 初始化空的圖形
ax.set_xlim(-10, 10)
ax.set_ylim(-10, 10)
ax.set_aspect('equal')
ax.grid(True, alpha=0.2)
ax.set_xlabel('X 座標', fontsize=12, fontweight='bold')
ax.set_ylabel('Y 座標', fontsize=12, fontweight='bold')
ax.set_title('基站位置', fontsize=14, fontweight='bold', pad=20)
ax.set_facecolor('#f8f9fa')

if args.center:
    auto_center_checkbox.set(1)
    auto_center_mode = True  # 讓 update_plot 直接置中

if args.AB and args.AC and args.BC:
    entryAB.insert(0, str(args.AB))
    entryAC.insert(0, str(args.AC))
    entryBC.insert(0, str(args.BC))
    update_plot()

root.mainloop()