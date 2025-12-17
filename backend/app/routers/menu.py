from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.db import SessionLocal

router = APIRouter(prefix="/menu", tags=["Menu"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.MenuItemResponse, status_code=status.HTTP_201_CREATED)
def create_menu_item(item: schemas.MenuItemCreate, db: Session = Depends(get_db)):
    """Yeni menü öğesi ekle"""
    restaurant = db.query(models.RestorantHesap).filter(models.RestorantHesap.restorantID == item.restorantID).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restoran bulunamadı")
    
    db_item = models.RestorantMenu(
        restorantID=item.restorantID,
        yemekadi=item.yemekadi,
        aciklama=item.aciklama,
        fiyat=item.fiyat,
        kategoriad=item.kategoriad
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/restaurant/{restoran_id}", response_model=List[schemas.MenuItemResponse])
def get_restaurant_menu(restoran_id: int, db: Session = Depends(get_db)):
    """Restoranın menüsünü getir"""
    menu_items = db.query(models.RestorantMenu).filter(models.RestorantMenu.restorantID == restoran_id).all()
    return menu_items

@router.get("/{menu_id}", response_model=schemas.MenuItemResponse)
def get_menu_item(menu_id: int, db: Session = Depends(get_db)):
    """Belirli menü öğesini getir"""
    item = db.query(models.RestorantMenu).filter(models.RestorantMenu.menuID == menu_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menü öğesi bulunamadı")
    return item

@router.delete("/{menu_id}", status_code=status.HTTP_200_OK)
def delete_menu_item(menu_id: int, db: Session = Depends(get_db)):
    """Menü öğesini sil"""
    item = db.query(models.RestorantMenu).filter(models.RestorantMenu.menuID == menu_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menü öğesi bulunamadı")
    
    try:
        # Önce menü fotoğraflarını sil
        db.query(models.MenuFoto).filter(models.MenuFoto.menuID == menu_id).delete(synchronize_session=False)
        
        # Menüye ait yorumları sil (menuID null yap veya sil)
        db.query(models.Yorum).filter(models.Yorum.menuID == menu_id).update(
            {models.Yorum.menuID: None}, 
            synchronize_session=False
        )
        
        # Menü öğesini sil
        db.delete(item)
        db.commit()
        
        return {
            "message": "Menü öğesi başarıyla silindi",
            "menuID": menu_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Silme işlemi başarısız: {str(e)}")