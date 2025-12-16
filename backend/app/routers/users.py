from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import sys
sys.path.append('..')

from app import models, schemas, utils
from app.db import SessionLocal

router = APIRouter(prefix="/users", tags=["Users"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=schemas.KullaniciResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.KullaniciCreate, db: Session = Depends(get_db)):
    """Yeni kullanıcı kaydı"""
    existing_user = db.query(models.KullaniciHesap).filter(models.KullaniciHesap.mail == user.mail).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı")
    
    salt = utils.generate_salt()
    password_hash = utils.hash_password(user.password, salt)
    
    db_user = models.KullaniciHesap(
        ad=user.ad,
        soyad=user.soyad,
        mail=user.mail,
        telefon=user.telefon,
        password_salt=salt,
        password_hash=password_hash,
        puan=0
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login")
def login_user(mail: str, password: str, db: Session = Depends(get_db)):
    """Kullanıcı girişi"""
    user = db.query(models.KullaniciHesap).filter(models.KullaniciHesap.mail == mail).first()
    if not user:
        raise HTTPException(status_code=401, detail="Email veya şifre hatalı")
    
    if not utils.verify_password(password, user.password_salt, user.password_hash):
        raise HTTPException(status_code=401, detail="Email veya şifre hatalı")
    
    return {
        "message": "Giriş başarılı",
        "kullaniciID": user.kullaniciID,
        "ad": user.ad,
        "soyad": user.soyad,
        "mail": user.mail
    }

@router.get("/", response_model=List[schemas.KullaniciResponse])
def get_all_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Tüm kullanıcıları listele"""
    users = db.query(models.KullaniciHesap).offset(skip).limit(limit).all()
    return users

@router.get("/{kullanici_id}", response_model=schemas.KullaniciResponse)
def get_user(kullanici_id: int, db: Session = Depends(get_db)):
    """Belirli kullanıcıyı getir"""
    user = db.query(models.KullaniciHesap).filter(models.KullaniciHesap.kullaniciID == kullanici_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return user