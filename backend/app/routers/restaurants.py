from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas, utils
from app.db import SessionLocal
import os
import uuid
from pathlib import Path

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])

# Fotoğrafların kaydedileceği dizin
UPLOAD_DIR = Path("uploads/restaurant_photos")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

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
        sehir=restaurant.sehir,
        ilce=restaurant.ilce,
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
        "longitude": restaurant.longitude,
        "sehir": restaurant.sehir,
        "ilce": restaurant.ilce
    }

@router.get("/")
def get_all_restaurants(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Tüm restoranları listele - ortalama puan ve yorum sayısı ile birlikte, yüksek puandan düşüğe sıralı"""
    from sqlalchemy import func, case, desc
    
    # Subquery ile ortalama puanı hesapla
    avg_rating_subquery = db.query(
        models.Yorum.restorantID,
        func.avg(models.Yorum.puan).label('ortalama_puan')
    ).filter(
        models.Yorum.puan.isnot(None)
    ).group_by(
        models.Yorum.restorantID
    ).subquery()
    
    # Restoranları ortalama puana göre sıralı getir
    restaurants_query = db.query(
        models.RestorantHesap,
        func.coalesce(avg_rating_subquery.c.ortalama_puan, 0).label('avg_puan')
    ).outerjoin(
        avg_rating_subquery,
        models.RestorantHesap.restorantID == avg_rating_subquery.c.restorantID
    ).order_by(
        desc('avg_puan')
    ).offset(skip).limit(limit)
    
    result = []
    for restaurant, avg_rating in restaurants_query.all():
        # Restorana ait yorum sayısını hesapla
        yorum_sayisi = db.query(func.count(models.Yorum.yorumID)).filter(
            models.Yorum.restorantID == restaurant.restorantID
        ).scalar()
        
        restaurant_dict = {
            "restorantID": restaurant.restorantID,
            "ad": restaurant.ad,
            "mail": restaurant.mail,
            "telefon": restaurant.telefon,
            "latitude": restaurant.latitude,
            "longitude": restaurant.longitude,
            "sehir": restaurant.sehir,
            "ilce": restaurant.ilce,
            "kayitTarih": restaurant.kayitTarih,
            "ortalamaPuan": float(avg_rating) if avg_rating else 0.0,
            "yorumSayisi": int(yorum_sayisi) if yorum_sayisi else 0
        }
        result.append(restaurant_dict)
    
    return result

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

# ==================== RESTORAN FOTOĞRAF ENDPOİNTLERİ ====================

@router.post("/{restoran_id}/photos", response_model=schemas.RestorantFotoResponse, status_code=status.HTTP_201_CREATED)
async def upload_restaurant_photo(
    restoran_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Restoran için fotoğraf yükle"""
    # Restoran var mı kontrol et
    restaurant = db.query(models.RestorantHesap).filter(models.RestorantHesap.restorantID == restoran_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restoran bulunamadı")
    
    # Dosya uzantısını kontrol et
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp']
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Sadece JPG, PNG ve WEBP formatları desteklenir")
    
    # Benzersiz dosya adı oluştur
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Dosyayı kaydet
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dosya yüklenirken hata: {str(e)}")
    
    # Veritabanına kaydet
    foto_url = f"/uploads/restaurant_photos/{unique_filename}"
    db_foto = models.RestorantFoto(
        restorantID=restoran_id,
        fotoURL=foto_url
    )
    db.add(db_foto)
    db.commit()
    db.refresh(db_foto)
    
    return db_foto

@router.get("/{restoran_id}/photos", response_model=List[schemas.RestorantFotoResponse])
def get_restaurant_photos(restoran_id: int, db: Session = Depends(get_db)):
    """Restoran fotoğraflarını listele"""
    restaurant = db.query(models.RestorantHesap).filter(models.RestorantHesap.restorantID == restoran_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restoran bulunamadı")
    
    photos = db.query(models.RestorantFoto).filter(models.RestorantFoto.restorantID == restoran_id).all()
    return photos

@router.delete("/photos/{foto_id}", status_code=status.HTTP_200_OK)
def delete_restaurant_photo(foto_id: int, db: Session = Depends(get_db)):
    """Restoran fotoğrafını sil"""
    photo = db.query(models.RestorantFoto).filter(models.RestorantFoto.fotoID == foto_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Fotoğraf bulunamadı")
    
    # Dosyayı diskten sil
    try:
        file_path = Path(photo.fotoURL.lstrip('/'))
        if file_path.exists():
            file_path.unlink()
    except Exception as e:
        print(f"Dosya silinirken hata: {str(e)}")
    
    # Veritabanından sil
    db.delete(photo)
    db.commit()
    
    return {"message": "Fotoğraf başarıyla silindi", "fotoID": foto_id}

@router.patch("/photos/{foto_id}/set-vitrin", response_model=schemas.RestorantFotoResponse)
def set_vitrin_photo(foto_id: int, db: Session = Depends(get_db)):
    """Fotoğrafı vitrin fotoğraf olarak işaretle"""
    photo = db.query(models.RestorantFoto).filter(models.RestorantFoto.fotoID == foto_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Fotoğraf bulunamadı")
    
    # Aynı restoranın diğer tüm fotoğraflarını vitrin olmayan yap
    db.query(models.RestorantFoto).filter(
        models.RestorantFoto.restorantID == photo.restorantID,
        models.RestorantFoto.fotoID != foto_id
    ).update({"vitrin": False}, synchronize_session=False)
    
    # Bu fotoğrafı vitrin yap
    photo.vitrin = True
    db.commit()
    db.refresh(photo)
    
    return photo