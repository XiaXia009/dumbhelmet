from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from pydantic import BaseModel
from typing import List, Optional
from sqlite_linker import SQLiteLinker
from influx_linker import Influxlinker
import time
import uvicorn

app = FastAPI()

sqlite_linker = SQLiteLinker()
influx_linker = Influxlinker()

sqlite_linker.init_db()


class Worker(BaseModel):
    name: str
    blood_type: str
    uwb_id: str


class UWBHardware(BaseModel):
    uwb_id: str
    uwb_uuid: str


class UWBPosition(BaseModel):
    uwb_uuid: str
    time: int
    x: float
    y: float


class UWBPositionInflux(BaseModel):
    tag_id: str
    time: int
    x: float
    y: float


class LoginRequest(BaseModel):
    email: str
    password: str


class MessageActivity(BaseModel):
    id: Optional[int]
    type: Optional[str] = "general_info"
    message: Optional[str] = "未知訊息"
    time: Optional[int]
    status: Optional[str] = "info"
    icon: Optional[str] = "Info"


@app.get("/")
def index():
    return "Welcome to FastAPI SQLite + InfluxDB Example!"


@app.post("/add_worker")
def add_worker(worker: Worker):
    sqlite_linker.add_worker(worker.name, worker.blood_type, worker.uwb_id)
    return {"message": "Worker added successfully!"}


@app.post("/add_uwb_hardware")
def add_uwb_hardware(hw: UWBHardware):
    sqlite_linker.add_uwb_hardware(hw.uwb_id, hw.uwb_uuid)
    return {"message": "UWB hardware added successfully!"}


@app.post("/add_uwb_position")
def add_uwb_position(pos: UWBPosition):
    sqlite_linker.add_uwb_position(pos.uwb_uuid, pos.time, pos.x, pos.y)
    return {"message": "UWB position added to SQLite successfully!"}


@app.post("/add_uwb_position_influx")
def add_uwb_position_influx(pos: UWBPositionInflux):
    influx_linker.write_position(pos.tag_id, pos.x, pos.y, pos.time)
    return {"message": "UWB position added to InfluxDB successfully!"}


@app.get("/workers")
def get_workers():
    return sqlite_linker.get_workers()


@app.get("/uwb_hardware")
def get_uwb_hardware():
    return sqlite_linker.get_uwb_hardware()


@app.get("/uwb_positions")
def get_uwb_positions():
    return sqlite_linker.get_uwb_positions()


@app.get("/uwb_positions_influx")
def get_uwb_positions_influx(
    tag_id: str = Query(...),
    start: str = Query(...),
    end: str = Query(...)
):
    return influx_linker.query_positions(tag_id=tag_id, start_date=start, end_date=end)


@app.post("/login")
def login(req: LoginRequest):
    if req.email == "admin@gmail.com" and req.password == "admin":
        return {"token": "mock-token"}
    else:
        return {"detail": "錯誤的密碼或電子郵件"}


@app.get("/me")
def me():
    return {
        "id": "1",
        "name": "Admin",
        "email": "admin@gmail.com",
        "role": "admin",
        "department": "Safety Management",
        "phone": "+886 912 345 678",
        "createdAt": "2024-01-15"
    }


# 簡單 WebSocket 替代
clients = set()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.add(websocket)
    print("Client connected")
    try:
        while True:
            data = await websocket.receive_json()
            activity = {
                "id": data.get("id") or int(time.time() * 1000),
                "type": data.get("type", "general_info"),
                "message": data.get("message", "未知訊息"),
                "time": data.get("time") or int(time.time() * 1000),
                "status": data.get("status", "info"),
                "icon": data.get("icon", "Info")
            }
            for client in clients:
                await client.send_json(activity)
    except WebSocketDisconnect:
        clients.remove(websocket)
        print("Client disconnected")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000, log_level="info")