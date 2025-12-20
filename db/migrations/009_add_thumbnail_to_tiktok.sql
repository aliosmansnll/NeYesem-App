-- TikTok videolarına thumbnail URL alanı ekle
ALTER TABLE "RestorantTikTok" 
ADD COLUMN "thumbnailURL" VARCHAR(500);

-- Mevcut videolar için boş değer kabul et
COMMENT ON COLUMN "RestorantTikTok"."thumbnailURL" IS 'TikTok video thumbnail URL (opsiyonel)';
