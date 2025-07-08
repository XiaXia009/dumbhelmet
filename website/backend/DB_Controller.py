import sqlite3

class DBController:
    def __init__(self, db_name='database.db'):
        self.db_name = db_name

    def _connect(self):
        """內部方法，建立資料庫連接"""
        return sqlite3.connect(self.db_name)

    def init_db(self):
        """初始化資料庫並創建所有表格"""
        conn = self._connect()
        c = conn.cursor()

        # 創建工人表 Peoples
        c.execute('''
            CREATE TABLE IF NOT EXISTS Peoples (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                blood_type TEXT,
                UWB_ID TEXT,
                FOREIGN KEY (UWB_ID) REFERENCES UWB_Hardware(UWB_ID)
            )
        ''')

        # 創建 UWB硬體表 UWB_Hardware
        c.execute('''
            CREATE TABLE IF NOT EXISTS UWB_Hardware (
                UWB_ID TEXT PRIMARY KEY,
                UWB_UUID TEXT
            )
        ''')

        # 創建 UWB定位表 UWB_Position
        c.execute('''
            CREATE TABLE IF NOT EXISTS UWB_Position (
                UWB_UUID TEXT,
                Time TEXT,
                x REAL,
                y REAL,
                FOREIGN KEY (UWB_UUID) REFERENCES UWB_Hardware(UWB_UUID)
            )
        ''')

        conn.commit()
        conn.close()

    def add_worker(self, name, blood_type, uwb_id):
        """添加新工人到 Peoples 表"""
        conn = self._connect()
        c = conn.cursor()
        c.execute("INSERT INTO Peoples (name, blood_type, UWB_ID) VALUES (?, ?, ?)", (name, blood_type, uwb_id))
        conn.commit()
        conn.close()

    def add_uwb_hardware(self, uwb_id, uwb_uuid):
        """添加新的 UWB 硬體到 UWB_Hardware 表"""
        conn = self._connect()
        c = conn.cursor()
        c.execute("INSERT INTO UWB_Hardware (UWB_ID, UWB_UUID) VALUES (?, ?)", (uwb_id, uwb_uuid))
        conn.commit()
        conn.close()

    def add_uwb_position(self, uwb_uuid, time, x, y):
        """添加 UWB 定位數據到 UWB_Position 表"""
        conn = self._connect()
        c = conn.cursor()
        c.execute("INSERT INTO UWB_Position (UWB_UUID, Time, x, y) VALUES (?, ?, ?, ?)", (uwb_uuid, time, x, y))
        conn.commit()
        conn.close()

    def get_workers(self):
        """獲取所有工人"""
        conn = self._connect()
        c = conn.cursor()
        c.execute("SELECT * FROM Peoples")
        workers = c.fetchall()
        conn.close()
        return workers

    def get_uwb_hardware(self):
        """獲取所有 UWB 硬體"""
        conn = self._connect()
        c = conn.cursor()
        c.execute("SELECT * FROM UWB_Hardware")
        hardware = c.fetchall()
        conn.close()
        return hardware

    def get_uwb_positions(self):
        """獲取所有 UWB 定位"""
        conn = self._connect()
        c = conn.cursor()
        c.execute("SELECT * FROM UWB_Position")
        positions = c.fetchall()
        conn.close()
        return positions
