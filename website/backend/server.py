from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
async def login(data: LoginRequest):
    if data.email == "admin@gmail.com" and data.password == "admin":
        return {
            "token": "mock-token"
        }
    else:
        raise HTTPException(status_code=401, detail="錯誤的密碼或電子郵件")

@app.get("/me")
async def me():
    # 模擬返回用戶資料
    return {
        "id": "1",
        "name": "Admin",
        "email": "admin@gmail.com",
        "role": "admin",
        "department": "Safety Management",
        "phone": "+886 912 345 678",
        "createdAt": "2024-01-15"
    }

if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
