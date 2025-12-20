from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.db import SessionLocal

router = APIRouter(prefix="/reviews", tags=["Reviews"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.YorumResponse, status_code=status.HTTP_201_CREATED)
def create_review(review: schemas.YorumCreate, db: Session = Depends(get_db)):
    """Restoran veya menü için yorum ekle"""
    # Kullanıcı kontrolü
    user = db.query(models.KullaniciHesap).filter(models.KullaniciHesap.kullaniciID == review.kullaniciID).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Restoran kontrolü
    restaurant = db.query(models.RestorantHesap).filter(models.RestorantHesap.restorantID == review.restorantID).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restoran bulunamadı")
    
    # Eğer menuID verilmişse, menü kontrolü
    if review.menuID:
        menu_item = db.query(models.RestorantMenu).filter(
            models.RestorantMenu.menuID == review.menuID,
            models.RestorantMenu.restorantID == review.restorantID
        ).first()
        if not menu_item:
            raise HTTPException(status_code=404, detail="Menü öğesi bulunamadı veya bu restorana ait değil")
    
    # Duplicate yorum kontrolü - aynı kullanıcı + restoran + menü kombinasyonu
    existing_review = db.query(models.Yorum).filter(
        models.Yorum.kullaniciID == review.kullaniciID,
        models.Yorum.restorantID == review.restorantID,
        models.Yorum.menuID == review.menuID
    ).first()
    
    if existing_review:
        if review.menuID:
            raise HTTPException(status_code=400, detail="Bu menü için zaten yorum yaptınız")
        else:
            raise HTTPException(status_code=400, detail="Bu restoran için zaten yorum yaptınız")
    
    db_review = models.Yorum(
        kullaniciID=review.kullaniciID,
        restorantID=review.restorantID,
        menuID=review.menuID,  # None veya menü ID'si
        yorum=review.yorum,
        puan=review.puan,
        fotoURL=review.fotoURL
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@router.get("/restaurant/{restoran_id}", response_model=List[schemas.YorumResponse])
def get_restaurant_reviews(restoran_id: int, db: Session = Depends(get_db)):
    """Restoranın tüm yorumlarını getir (restoran + menü yorumları)"""
    reviews = db.query(models.Yorum).filter(models.Yorum.restorantID == restoran_id).order_by(models.Yorum.yorumTarih.desc()).all()
    
    # Kullanıcı ve menü bilgilerini ekle
    result = []
    for review in reviews:
        review_dict = {
            "yorumID": review.yorumID,
            "kullaniciID": review.kullaniciID,
            "restorantID": review.restorantID,
            "menuID": review.menuID,
            "yorum": review.yorum,
            "puan": review.puan,
            "fotoURL": review.fotoURL,
            "yorumTarih": review.yorumTarih,
            "kullaniciAd": None,
            "kullaniciSoyad": None,
            "menuAd": None
        }
        user = db.query(models.KullaniciHesap).filter(models.KullaniciHesap.kullaniciID == review.kullaniciID).first()
        if user:
            review_dict["kullaniciAd"] = user.ad
            review_dict["kullaniciSoyad"] = user.soyad
        
        # Eğer menü yorumu ise menü adını da ekle
        if review.menuID:
            menu = db.query(models.RestorantMenu).filter(models.RestorantMenu.menuID == review.menuID).first()
            if menu:
                review_dict["menuAd"] = menu.yemekadi
        
        result.append(review_dict)
    
    return result

@router.get("/restaurant/{restoran_id}/only", response_model=List[schemas.YorumResponse])
def get_restaurant_only_reviews(restoran_id: int, db: Session = Depends(get_db)):
    """Sadece restorana yapılmış yorumları getir (menuID = NULL)"""
    reviews = db.query(models.Yorum).filter(
        models.Yorum.restorantID == restoran_id,
        models.Yorum.menuID == None
    ).order_by(models.Yorum.yorumTarih.desc()).all()
    
    # Kullanıcı bilgilerini ekle
    result = []
    for review in reviews:
        review_dict = {
            "yorumID": review.yorumID,
            "kullaniciID": review.kullaniciID,
            "restorantID": review.restorantID,
            "menuID": review.menuID,
            "yorum": review.yorum,
            "puan": review.puan,
            "fotoURL": review.fotoURL,
            "yorumTarih": review.yorumTarih,
            "kullaniciAd": None,
            "kullaniciSoyad": None
        }
        user = db.query(models.KullaniciHesap).filter(models.KullaniciHesap.kullaniciID == review.kullaniciID).first()
        if user:
            review_dict["kullaniciAd"] = user.ad
            review_dict["kullaniciSoyad"] = user.soyad
        result.append(review_dict)
    
    return result

@router.get("/menu/{menu_id}", response_model=List[schemas.YorumResponse])
def get_menu_reviews(menu_id: int, db: Session = Depends(get_db)):
    """Belirli menü öğesinin yorumlarını getir"""
    reviews = db.query(models.Yorum).filter(models.Yorum.menuID == menu_id).order_by(models.Yorum.yorumTarih.desc()).all()
    
    # Kullanıcı bilgilerini ekle
    result = []
    for review in reviews:
        review_dict = {
            "yorumID": review.yorumID,
            "kullaniciID": review.kullaniciID,
            "restorantID": review.restorantID,
            "menuID": review.menuID,
            "yorum": review.yorum,
            "puan": review.puan,
            "fotoURL": review.fotoURL,
            "yorumTarih": review.yorumTarih,
            "kullaniciAd": None,
            "kullaniciSoyad": None
        }
        user = db.query(models.KullaniciHesap).filter(models.KullaniciHesap.kullaniciID == review.kullaniciID).first()
        if user:
            review_dict["kullaniciAd"] = user.ad
            review_dict["kullaniciSoyad"] = user.soyad
        result.append(review_dict)
    
    return result

@router.get("/user/{kullanici_id}", response_model=List[schemas.YorumResponse])
def get_user_reviews(kullanici_id: int, db: Session = Depends(get_db)):
    """Kullanıcının tüm yorumlarını getir"""
    reviews = db.query(models.Yorum).filter(models.Yorum.kullaniciID == kullanici_id).order_by(models.Yorum.yorumTarih.desc()).all()
    
    # Kullanıcı bilgilerini ekle
    result = []
    for review in reviews:
        review_dict = {
            "yorumID": review.yorumID,
            "kullaniciID": review.kullaniciID,
            "restorantID": review.restorantID,
            "menuID": review.menuID,
            "yorum": review.yorum,
            "puan": review.puan,
            "fotoURL": review.fotoURL,
            "yorumTarih": review.yorumTarih,
            "kullaniciAd": None,
            "kullaniciSoyad": None
        }
        user = db.query(models.KullaniciHesap).filter(models.KullaniciHesap.kullaniciID == review.kullaniciID).first()
        if user:
            review_dict["kullaniciAd"] = user.ad
            review_dict["kullaniciSoyad"] = user.soyad
        result.append(review_dict)
    
    return result
@router.delete("/bulk-delete", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_reviews(db: Session = Depends(get_db)):
    """UYARI: Tüm yorumları sil"""
    try:
        deleted_count = db.query(models.Yorum).delete(synchronize_session=False)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Silme işlemi başarısız: {str(e)}")

@router.delete("/restaurant/{restoran_id}/all", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_restaurant_reviews(restoran_id: int, db: Session = Depends(get_db)):
    """Belirli bir restoranın tüm yorumlarını sil"""
    restoran = db.query(models.RestorantHesap).filter(
        models.RestorantHesap.restorantID == restoran_id
    ).first()
    
    if not restoran:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restoran bulunamadı"
        )
    
    try:
        deleted_count = db.query(models.Yorum).filter(
            models.Yorum.restorantID == restoran_id
        ).delete(synchronize_session=False)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Silme işlemi başarısız: {str(e)}")
