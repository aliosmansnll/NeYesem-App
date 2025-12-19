-- RestorantTikTok tablosunu oluştur
CREATE TABLE IF NOT EXISTS "RestorantTikTok" (
    "tiktokID" SERIAL PRIMARY KEY,
    "restorantID" INTEGER NOT NULL,
    "tiktokURL" VARCHAR(500) NOT NULL,
    "baslik" VARCHAR(200),
    "eklenmeTarih" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_restoran
        FOREIGN KEY ("restorantID")
        REFERENCES "RestorantHesap"("restorantID")
        ON DELETE CASCADE
);

-- Index oluştur (hızlı sorgulama için)
CREATE INDEX IF NOT EXISTS idx_tiktok_restoran ON "RestorantTikTok"("restorantID");

-- URL format kontrolü
ALTER TABLE "RestorantTikTok" 
ADD CONSTRAINT chk_tiktok_url_format 
CHECK ("tiktokURL" LIKE 'http%');
