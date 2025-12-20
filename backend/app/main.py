from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.db import engine, Base
from app.routers import users, restaurants, menu, reviews, tiktok
from pathlib import Path

# Tabloları oluştur
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NeYesem API", version="1.0.0")

# CORS ayarları (React Native için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static dosyalar için upload klasörünü mount et
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Routers
app.include_router(users.router)
app.include_router(restaurants.router)
app.include_router(menu.router)
app.include_router(reviews.router)
app.include_router(tiktok.router)

@app.get("/")
def read_root():
    return {"message": "NeYesem API çalışıyor! 🚀"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}