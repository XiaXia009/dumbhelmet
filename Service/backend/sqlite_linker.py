import sqlite3

class SQLiteLinker:
    def __init__(self, db_name='database.db'):
        self.db_name = db_name
        self.init_db()

    def connect(self):
        return sqlite3.connect(self.db_name)

    def init_db(self):
        conn = self.connect()
        c = conn.cursor()

        # 改成 TEXT 主鍵
        c.execute('''
            CREATE TABLE IF NOT EXISTS Staff (
                Staff_ID TEXT PRIMARY KEY,
                Name TEXT,
                Position TEXT,
                Department TEXT,
                Phone_number TEXT,
                Employment_status TEXT,
                Blood_type TEXT
            )
        ''')

        c.execute('''
            CREATE TABLE IF NOT EXISTS Helmet (
                Staff_ID TEXT,
                IMEI TEXT,
                Helmet_phone_number TEXT DEFAULT NULL,
                Helmet_charge REAL DEFAULT NULL,
                FOREIGN KEY(Staff_ID) REFERENCES Staff(Staff_ID)
            )
        ''')

        conn.commit()
        conn.close()

    def get_next_staff_id(self):
        conn = self.connect()
        c = conn.cursor()
        c.execute("SELECT Staff_ID FROM Staff ORDER BY Staff_ID DESC LIMIT 1")
        last = c.fetchone()
        conn.close()

        if last is None:
            next_num = 1
        else:
            # 拆出數字部分
            next_num = int(last[0].split('_')[1]) + 1
        return f"Staff_{next_num:03d}"

    def add_staff(self, name, position, department, phone, status, blood):
        staff_id = self.get_next_staff_id()
        conn = self.connect()
        c = conn.cursor()
        c.execute('''
            INSERT INTO Staff (Staff_ID, Name, Position, Department, Phone_number, Employment_status, Blood_type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (staff_id, name, position, department, phone, status, blood))
        conn.commit()
        conn.close()
        return staff_id

    def get_staffs(self):
        conn = self.connect()
        c = conn.cursor()
        c.execute('SELECT * FROM Staff')
        staff_list = c.fetchall()
        conn.close()
        return staff_list

    def add_helmet(self, staff_id, imei):
        conn = self.connect()
        c = conn.cursor()
        c.execute('''
            INSERT INTO Helmet (Staff_ID, IMEI)
            VALUES (?, ?)
        ''', (staff_id, imei))
        conn.commit()
        conn.close()

    def get_helmets(self):
        conn = self.connect()
        c = conn.cursor()
        c.execute('''
            SELECT h.Staff_ID, s.Name, h.IMEI, h.Helmet_phone_number, h.Helmet_charge
            FROM Helmet h
            LEFT JOIN Staff s ON h.Staff_ID = s.Staff_ID
        ''')
        helmet_list = c.fetchall()
        conn.close()
        return helmet_list
    
    def get_unbound_staffs(self):
        conn = self.connect()
        c = conn.cursor()
        c.execute('''
            SELECT *
            FROM Staff
            WHERE Staff_ID NOT IN (
                SELECT Staff_ID
                FROM Helmet
            )
        ''')
        rows = c.fetchall()
        conn.close()
        return rows

    def update_helmet_charge(self, imei, charge):
        conn = self.connect()
        c = conn.cursor()
        c.execute('''
            UPDATE Helmet
            SET Helmet_charge = ?
            WHERE IMEI = ?
        ''', (charge, imei))
        conn.commit()
        updated_rows = c.rowcount
        conn.close()
        return updated_rows > 0

    def update_helmet_phone(self, imei, helmet_phone):
        conn = self.connect()
        c = conn.cursor()
        c.execute('''
            UPDATE Helmet
            SET Helmet_phone_number = ?
            WHERE IMEI = ?
        ''', (helmet_phone, imei))
        conn.commit()
        updated_rows = c.rowcount
        conn.close()
        return updated_rows > 0
