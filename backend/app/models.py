from sqlalchemy import Column, Integer, String, DateTime, SmallInteger, Boolean, CHAR, Time, ForeignKey, TEXT, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

class KullaniciHesap(Base):
    __tablename__ = "KullaniciHesap"
    
    kullaniciID = Column(Integer, primary_key=True, index=True)
    ad = Column(String(20), nullable=False)
    soyad = Column(String(20), nullable=False)
    mail = Column(String(50), nullable=False, unique=True, index=True)
    password_salt = Column(String(30), nullable=False)
    password_hash = Column(String(255), nullable=False)
    telefon = Column(CHAR(15))
    puan = Column(SmallInteger)
    kayitTar = Column(DateTime, default=datetime.utcnow)
    
    yorumlar = relationship("Yorum", back_populates="kullanici")

class RestorantHesap(Base):
    __tablename__ = "RestorantHesap"
    
    restorantID = Column(Integer, primary_key=True, index=True)
    ad = Column(String(40), nullable=False)
    mail = Column(String(50), nullable=False, unique=True, index=True)
    password_salt = Column(String(30), nullable=False)
    password_hash = Column(String(255), nullable=False)
    latitude = Column(Float)  # Enlem
    longitude = Column(Float)  # Boylam
    telefon = Column(CHAR(15))
    sehir = Column(String(50))  # Şehir
    ilce = Column(String(50))  # İlçe/Bölge
    kayitTarih = Column(DateTime, default=datetime.utcnow)
    
    menuler = relationship("RestorantMenu", back_populates="restoran")
    yorumlar = relationship("Yorum", back_populates="restoran")
    fotolar = relationship("RestorantFoto", back_populates="restoran")

class RestorantMenu(Base):
    __tablename__ = "RestorantMenu"
    
    menuID = Column(Integer, primary_key=True, index=True)
    restorantID = Column(Integer, ForeignKey("RestorantHesap.restorantID"), nullable=False)
    yemekadi = Column(String(40), nullable=False)
    aciklama = Column(String(80))
    fiyat = Column(SmallInteger, nullable=False)
    kategoriad = Column(String(25))
    
    restoran = relationship("RestorantHesap", back_populates="menuler")
    fotolar = relationship("MenuFoto", back_populates="menu")

class MenuFoto(Base):
    __tablename__ = "MenuFoto"
    
    fotoID = Column(Integer, primary_key=True, index=True)
    menuID = Column(Integer, ForeignKey("RestorantMenu.menuID"), nullable=False)
    fotoURL = Column(String(500), nullable=False)
    
    menu = relationship("RestorantMenu", back_populates="fotolar")

class Yorum(Base):
    __tablename__ = "Yorum"
    
    yorumID = Column(Integer, primary_key=True, index=True)
    kullaniciID = Column(Integer, ForeignKey("KullaniciHesap.kullaniciID"), nullable=False)
    menuID = Column(Integer, ForeignKey("RestorantMenu.menuID"))
    restorantID = Column(Integer, ForeignKey("RestorantHesap.restorantID"), nullable=False)
    yorum = Column(String(100))
    yorumTarih = Column(DateTime, default=datetime.utcnow)
    puan = Column(SmallInteger)
    fotoURL = Column(String(500))
    
    kullanici = relationship("KullaniciHesap", back_populates="yorumlar")
    restoran = relationship("RestorantHesap", back_populates="yorumlar")

class RestorantFoto(Base):
    __tablename__ = "RestorantFoto"
    
    fotoID = Column(Integer, primary_key=True, index=True)
    restorantID = Column(Integer, ForeignKey("RestorantHesap.restorantID"), nullable=False)
    fotoURL = Column(String(500), nullable=False)
    vitrin = Column(Boolean, default=False)
    
    restoran = relationship("RestorantHesap", back_populates="fotolar")