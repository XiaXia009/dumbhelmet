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

        conn.commit()
        conn.close()

    def add_worker(self, name, blood_type, uwb_id):
        """添加新工人到 Peoples 表"""
        conn = self._connect()
        c = conn.cursor()
        c.execute("INSERT INTO Peoples (name, blood_type, UWB_ID) VALUES (?, ?, ?)", (name, blood_type, uwb_id))
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