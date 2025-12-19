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
def login_user(credentials: schemas.KullaniciLogin, db: Session = Depends(get_db)):
    """Kullanıcı girişi"""
    user = db.query(models.KullaniciHesap).filter(models.KullaniciHesap.mail == credentials.mail).first()
    if not user:
        raise HTTPException(status_code=401, detail="Email veya şifre hatalı")
    
    if not utils.verify_password(credentials.password, user.password_salt, user.password_hash):
        raise HTTPException(status_code=401, detail="Email veya şifre hatalı")
    
    return {
        "message": "Giriş başarılı",
        "kullaniciID": user.kullaniciID,
        "ad": user.ad,
        "soyad": user.soyad,
        "mail": user.mail,
        "puan": user.puan
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

@router.delete("/bulk-delete", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_users(db: Session = Depends(get_db)):
    """UYARI: Tüm kullanıcı hesaplarını sil"""
    try:
        # Önce tüm yorumları sil
        db.query(models.Yorum).delete(synchronize_session=False)
        # Sonra tüm kullanıcıları sil
        deleted_count = db.query(models.KullaniciHesap).delete(synchronize_session=False)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Silme işlemi başarısız: {str(e)}")

@router.delete("/{kullanici_id}", status_code=status.HTTP_200_OK)
def delete_user(kullanici_id: int, db: Session = Depends(get_db)):
    """Kullanıcı silme"""
    user = db.query(models.KullaniciHesap).filter(models.KullaniciHesap.kullaniciID == kullanici_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    try:
        # Kullanıcının yorumlarını sil
        db.query(models.Yorum).filter(models.Yorum.kullaniciID == kullanici_id).delete(synchronize_session=False)
        
        # Kullanıcıyı sil
        db.delete(user)
        db.commit()
        
        return {
            "message": "Kullanıcı başarıyla silindi",
            "kullaniciID": kullanici_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Silme işlemi başarısız: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Silme işlemi başarısız: {str(e)}")