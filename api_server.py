from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import sqlite3
import os

# =========================
# App init
# =========================
app = FastAPI(
    title="Weidun Solar API",
    description="API for solar performance monitoring (PAC, Eday)",
    version="1.0.0",
)

# =========================
# CORS (for Expo / Mobile App)
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # 内部系统先全开，之后可锁域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Database
# =========================
DB_PATH = "weidun_cloud.db"

def get_db():
    return sqlite3.connect(DB_PATH)

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            site TEXT,
            pac_kw REAL,
            eday_kwh REAL,
            timestamp TEXT
        )
    """)
    conn.commit()
    conn.close()

@app.on_event("startup")
def startup():
    init_db()

# =========================
# Root
# =========================
@app.get("/")
def root():
    return {
        "service": "Weidun Solar API",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }

# =========================
# Health check (Render / Monitoring)
# =========================
@app.get("/health")
def health():
    return {"ok": True, "time": datetime.utcnow()}

# =========================
# Insert demo data (for testing)
# =========================
@app.post("/api/performance/add")
def add_performance(
    site: str,
    pac_kw: float,
    eday_kwh: float
):
    conn = get_db()
    c = conn.cursor()
    c.execute(
        "INSERT INTO performance (site, pac_kw, eday_kwh, timestamp) VALUES (?, ?, ?, ?)",
        (site, pac_kw, eday_kwh, datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()

    return {"status": "ok"}

# =========================
# Get latest performance (App uses this)
# =========================
@app.get("/api/performance/latest")
def get_latest(site: str = "Site A"):
    conn = get_db()
    c = conn.cursor()
    c.execute(
        """
        SELECT pac_kw, eday_kwh, timestamp
        FROM performance
        WHERE site = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (site,)
    )
    row = c.fetchone()
    conn.close()

    if not row:
        return {
            "site": site,
            "pac_kw": 0,
            "eday_kwh": 0,
            "timestamp": None
        }

    return {
        "site": site,
        "pac_kw": row[0],
        "eday_kwh": row[1],
        "timestamp": row[2]
    }

# =========================
# Get today history (for charts)
# =========================
@app.get("/api/performance/today")
def get_today(site: str = "Site A"):
    conn = get_db()
    c = conn.cursor()

    today = datetime.utcnow().date().isoformat()

    c.execute(
        """
        SELECT pac_kw, eday_kwh, timestamp
        FROM performance
        WHERE site = ?
        AND date(timestamp) = ?
        ORDER BY timestamp ASC
        """,
        (site, today)
    )

    rows = c.fetchall()
    conn.close()

    return [
        {
            "pac_kw": r[0],
            "eday_kwh": r[1],
            "timestamp": r[2]
        }
        for r in rows
    ]


