# api_server.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from fastapi import FastAPI

app = FastAPI(title="Weidun API", version="1.0")

@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "weidun-api",
        "docs": "/docs"
    }

app = FastAPI(title="Weidun API", version="1.0.0")

# ✅ 允许手机 App / Web 调用
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发阶段先用 *，上线后改成你的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {
        "ok": True,
        "service": "weidun-api",
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

# 示例：你之后可以把 /live-data、/device 等 API 搬进来
@app.get("/live-data")
def live_data(site: str = "A"):
    return {
        "ok": True,
        "site": site,
        "pac": 273.2,
        "eday": 1327.6,
        "time": datetime.now().strftime("%H:%M")
    }

