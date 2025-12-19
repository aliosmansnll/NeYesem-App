-- TikTok URL alanını RestorantHesap tablosuna ekle
ALTER TABLE RestorantHesap 
ADD COLUMN tiktokURL VARCHAR(500);

-- İsteğe bağlı: Örnek TikTok URL formatı için constraint ekle
-- TikTok URL'leri genellikle şu formattadır: https://www.tiktok.com/@username/video/1234567890
ALTER TABLE RestorantHesap 
ADD CONSTRAINT chk_tiktok_url 
CHECK (tiktokURL IS NULL OR tiktokURL LIKE 'http%');
