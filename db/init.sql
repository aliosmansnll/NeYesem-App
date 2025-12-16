CREATE TABLE KullaniciHesap (
    kullaniciID SERIAL PRIMARY KEY,
    ad VARCHAR(20) NOT NULL,
    soyad VARCHAR(20) NOT NULL,
    mail VARCHAR(50) NOT NULL UNIQUE,
    password_salt VARCHAR(30) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefon CHAR(15),
    puan SMALLINT,
    kayitTar TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE RestorantHesap (
    restorantID SERIAL PRIMARY KEY,
    ad VARCHAR(40) NOT NULL,
    mail VARCHAR(50) NOT NULL UNIQUE,
    password_salt VARCHAR(30) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    konum POINT,
    telefon CHAR(15),
    kayitTarih TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE RestorantMenu (
    menuID SERIAL PRIMARY KEY,
    restorantID INT NOT NULL REFERENCES RestorantHesap(restorantID),
    yemekadi VARCHAR(40) NOT NULL,
    aciklama VARCHAR(80),
    fiyat SMALLINT NOT NULL,
    kategoriad VARCHAR(25)
);

CREATE TABLE MenuFoto (
    fotoID SERIAL PRIMARY KEY,
    menuID INT NOT NULL REFERENCES RestorantMenu(menuID),
    fotoURL VARCHAR(500) NOT NULL
);

CREATE TABLE RestorantAcikGunler (
    restorantID INT NOT NULL REFERENCES RestorantHesap(restorantID),
    gunID SMALLINT NOT NULL,
    acilisSaat TIME NOT NULL,
    kapanisSaat TIME NOT NULL,
    PRIMARY KEY(restorantID, gunID)
);

CREATE TABLE Yorum (
    yorumID SERIAL PRIMARY KEY,
    kullaniciID INT NOT NULL REFERENCES KullaniciHesap(kullaniciID),
    menuID INT REFERENCES RestorantMenu(menuID),
    restorantID INT NOT NULL REFERENCES RestorantHesap(restorantID),
    yorum VARCHAR(100),
    yorumTarih TIMESTAMP NOT NULL DEFAULT NOW(),
    puan SMALLINT,
    fotoURL VARCHAR(500)
);

CREATE TABLE RestorantFoto (
    fotoID SERIAL PRIMARY KEY,
    restorantID INT NOT NULL REFERENCES RestorantHesap(restorantID),
    fotoURL VARCHAR(500) NOT NULL
);

CREATE TABLE TikTokVideo (
    videoID SERIAL PRIMARY KEY,
    restorantID INT NOT NULL REFERENCES RestorantHesap(restorantID),
    eklemeTarih TIMESTAMP DEFAULT NOW(),
    tiktokURL VARCHAR(500) NOT NULL
);

CREATE TABLE Kampanya (
    kampanyaID SERIAL PRIMARY KEY,
    restorantID INT NOT NULL REFERENCES RestorantHesap(restorantID),
    baslik VARCHAR(50),
    aciklama VARCHAR(200),
    baslangicTarih TIMESTAMP,
    bitisTarih TIMESTAMP,
    indirimOrani SMALLINT
);

CREATE TABLE Abone (
    aboneID SERIAL PRIMARY KEY,
    restorantID INT NOT NULL REFERENCES RestorantHesap(restorantID),
    tur VARCHAR(10),
    aboneTarih TIMESTAMP,
    bitisTarih TIMESTAMP,
    fiyat SMALLINT
);

CREATE TABLE Logs (
    logID SERIAL PRIMARY KEY,
    hesapID INT NOT NULL,
    hesapTur BOOLEAN NOT NULL,   -- 0: kullanıcı, 1: restoran
    aksiyonTipi VARCHAR(50),
    logAdress VARCHAR(100),
    IPAdress VARCHAR(45)
);
