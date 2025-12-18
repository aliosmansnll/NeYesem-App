-- Geçersiz puanları düzelt ve constraint ekle

-- Önce 5'ten büyük puanları 5'e çek
UPDATE "Yorum" SET puan = 5 WHERE puan > 5;

-- 0'dan küçük puanları 0'a çek  
UPDATE "Yorum" SET puan = 0 WHERE puan < 0;

-- Şimdi constraint'leri ekle
ALTER TABLE "Yorum" 
ADD CONSTRAINT check_yorum_puan 
CHECK (puan IS NULL OR (puan >= 0 AND puan <= 5));

ALTER TABLE "KullaniciHesap" 
ADD CONSTRAINT check_kullanici_puan 
CHECK (puan IS NULL OR puan >= 0);
