from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import httpx
import re
from .. import models, schemas
from ..db import get_db

router = APIRouter(
    prefix="/tiktok",
    tags=["tiktok"]
)

@router.get("/thumbnail")
async def get_tiktok_thumbnail(url: str):
    """TikTok video URL'sinden thumbnail çek"""
    try:
        # TikTok oembed API kullan
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.tiktok.com/oembed",
                params={"url": url},
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "thumbnailURL": data.get("thumbnail_url"),
                    "title": data.get("title"),
                    "author_name": data.get("author_name")
                }
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="TikTok API'den thumbnail alınamadı"
                )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Thumbnail çekilemedi: {str(e)}"
        )

@router.get("/restaurant/{restoran_id}", response_model=List[schemas.RestorantTikTokResponse])
def get_restaurant_tiktok_videos(restoran_id: int, db: Session = Depends(get_db)):
    """Restoranın TikTok videolarını listele"""
    videos = db.query(models.RestorantTikTok).filter(
        models.RestorantTikTok.restorantID == restoran_id
    ).order_by(models.RestorantTikTok.eklenmeTarih.desc()).all()
    
    return videos

@router.post("/", response_model=schemas.RestorantTikTokResponse, status_code=status.HTTP_201_CREATED)
def add_tiktok_video(video: schemas.RestorantTikTokCreate, db: Session = Depends(get_db)):
    """Yeni TikTok videosu ekle"""
    # Restoran var mı kontrol et
    restoran = db.query(models.RestorantHesap).filter(
        models.RestorantHesap.restorantID == video.restorantID
    ).first()
    
    if not restoran:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restoran bulunamadı"
        )
    
    # TikTok videosu oluştur
    db_video = models.RestorantTikTok(**video.dict())
    db.add(db_video)
    db.commit()
    db.refresh(db_video)
    
    return db_video

@router.delete("/{tiktok_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tiktok_video(tiktok_id: int, db: Session = Depends(get_db)):
    """TikTok videosunu sil"""
    video = db.query(models.RestorantTikTok).filter(
        models.RestorantTikTok.tiktokID == tiktok_id
    ).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video bulunamadı"
        )
    
    db.delete(video)
    db.commit()
    
    return None

@router.delete("/restaurant/{restoran_id}/all", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_restaurant_tiktok_videos(restoran_id: int, db: Session = Depends(get_db)):
    """Restoranın tüm TikTok videolarını sil"""
    # Restoran var mı kontrol et
    restoran = db.query(models.RestorantHesap).filter(
        models.RestorantHesap.restorantID == restoran_id
    ).first()
    
    if not restoran:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restoran bulunamadı"
        )
    
    # Tüm videoları sil
    deleted_count = db.query(models.RestorantTikTok).filter(
        models.RestorantTikTok.restorantID == restoran_id
    ).delete()
    
    db.commit()
    
    return None

@router.get("/{tiktok_id}", response_model=schemas.RestorantTikTokResponse)
def get_tiktok_video(tiktok_id: int, db: Session = Depends(get_db)):
    """Tek bir TikTok videosunu getir"""
    video = db.query(models.RestorantTikTok).filter(
        models.RestorantTikTok.tiktokID == tiktok_id
    ).first()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video bulunamadı"
        )
    
    return video
