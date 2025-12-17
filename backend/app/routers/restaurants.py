from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas, utils
from app.db import SessionLocal

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=schemas.RestorantResponse, status_code=status.HTTP_201_CREATED)
def register_restaurant(restaurant: schemas.RestorantCreate, db: Session = Depends(get_db)):
    """Yeni restoran kaydı"""
    existing = db.query(models.RestorantHesap).filter(models.RestorantHesap.mail == restaurant.mail).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı")
    
    salt = utils.generate_salt()
    password_hash = utils.hash_password(restaurant.password, salt)
    
    db_restaurant = models.RestorantHesap(
        ad=restaurant.ad,
        mail=restaurant.mail,
        telefon=restaurant.telefon,
        latitude=restaurant.latitude,
        longitude=restaurant.longitude,
        password_salt=salt,
        password_hash=password_hash
    )
    db.add(db_restaurant)
    db.commit()
    db.refresh(db_restaurant)
    return db_restaurant

@router.post("/login")
def login_restaurant(credentials: schemas.RestorantLogin, db: Session = Depends(get_db)):
    """Restoran girişi"""
    restaurant = db.query(models.RestorantHesap).filter(models.RestorantHesap.mail == credentials.mail).first()
    if not restaurant:
        raise HTTPException(status_code=401, detail="Email veya şifre hatalı")
    
    if not utils.verify_password(credentials.password, restaurant.password_salt, restaurant.password_hash):
        raise HTTPException(status_code=401, detail="Email veya şifre hatalı")
    
    return {
        "message": "Giriş başarılı",
        "restorantID": restaurant.restorantID,
        "ad": restaurant.ad,
        "mail": restaurant.mail,
        "telefon": restaurant.telefon,
        "latitude": restaurant.latitude,
        "longitude": restaurant.longitude
    }

@router.get("/", response_model=List[schemas.RestorantResponse])
def get_all_restaurants(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Tüm restoranları listele"""
    restaurants = db.query(models.RestorantHesap).offset(skip).limit(limit).all()
    return restaurants

@router.get("/{restoran_id}", response_model=schemas.RestorantResponse)
def get_restaurant(restoran_id: int, db: Session = Depends(get_db)):
    """Belirli restoranı getir"""
    restaurant = db.query(models.RestorantHesap).filter(models.RestorantHesap.restorantID == restoran_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restoran bulunamadı")
    return restaurant

@router.delete("/{restoran_id}", status_code=status.HTTP_200_OK)
def delete_restaurant(restoran_id: int, db: Session = Depends(get_db)):
    """Restoran silme"""
    restaurant = db.query(models.RestorantHesap).filter(models.RestorantHesap.restorantID == restoran_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restoran bulunamadı")
    
    try:
        # Restorana ait yorumları sil
        db.query(models.Yorum).filter(models.Yorum.restorantID == restoran_id).delete(synchronize_session=False)
        
        # Restorana ait menü fotoğraflarını sil
        menu_ids = db.query(models.RestorantMenu.menuID).filter(models.RestorantMenu.restorantID == restoran_id).all()
        menu_ids = [m[0] for m in menu_ids]
        if menu_ids:
            db.query(models.MenuFoto).filter(models.MenuFoto.menuID.in_(menu_ids)).delete(synchronize_session=False)
        
        # Restorana ait menü öğelerini sil
        db.query(models.RestorantMenu).filter(models.RestorantMenu.restorantID == restoran_id).delete(synchronize_session=False)
        
        # Restoran fotoğraflarını sil
        db.query(models.RestorantFoto).filter(models.RestorantFoto.restorantID == restoran_id).delete(synchronize_session=False)
        
        # Restoranı sil
        db.delete(restaurant)
        db.commit()
        
        return {
            "message": "Restoran başarıyla silindi",
            "restorantID": restoran_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Silme işlemi başarısız: {str(e)}")