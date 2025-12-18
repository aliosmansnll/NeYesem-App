from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime

class KullaniciBase(BaseModel):
    ad: str
    soyad: str
    mail: EmailStr
    telefon: Optional[str] = None

class KullaniciCreate(KullaniciBase):
    password: str

class KullaniciLogin(BaseModel):
    mail: EmailStr
    password: str

class KullaniciResponse(KullaniciBase):
    kullaniciID: int
    puan: Optional[int] = None
    kayitTar: datetime
    
    class Config:
        from_attributes = True

class RestorantBase(BaseModel):
    ad: str
    mail: EmailStr
    telefon: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class RestorantCreate(RestorantBase):
    password: str

class RestorantLogin(BaseModel):
    mail: EmailStr
    password: str

class RestorantResponse(RestorantBase):
    restorantID: int
    kayitTarih: datetime
    
    class Config:
        from_attributes = True

class MenuItemBase(BaseModel):
    yemekadi: str
    aciklama: Optional[str] = None
    fiyat: int
    kategoriad: Literal['Tatlı', 'Döner', 'Burger', 'Etli Ekmek', 'Restorana Özel'] = 'Restorana Özel'

class MenuItemCreate(MenuItemBase):
    restorantID: int

class MenuItemResponse(MenuItemBase):
    menuID: int
    restorantID: int
    
    class Config:
        from_attributes = True

class YorumBase(BaseModel):
    yorum: Optional[str] = None
    puan: Optional[int] = Field(None, ge=0, le=5, description="Puan 0-5 arası olmalıdır")
    fotoURL: Optional[str] = None

class YorumCreate(YorumBase):
    kullaniciID: int
    restorantID: int
    menuID: Optional[int] = None  # Menü yorumu için opsiyonel

class YorumResponse(BaseModel):
    yorumID: int
    kullaniciID: int
    restorantID: int
    menuID: Optional[int] = None
    yorum: Optional[str] = None
    puan: Optional[int] = Field(None, ge=0, le=5)
    fotoURL: Optional[str] = None
    yorumTarih: datetime
    kullaniciAd: Optional[str] = None
    kullaniciSoyad: Optional[str] = None
    
    class Config:
        from_attributes = True