from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import engine, Base
from app.routers import users, restaurants, menu, reviews

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

# Routers
app.include_router(users.router)
app.include_router(restaurants.router)
app.include_router(menu.router)
app.include_router(reviews.router)

@app.get("/")
def read_root():
    return {"message": "NeYesem API çalışıyor! 🚀"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}