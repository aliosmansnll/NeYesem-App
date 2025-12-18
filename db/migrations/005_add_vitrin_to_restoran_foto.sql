-- Restoran fotoğraflarına vitrin fotoğraf özelliği ekleme
ALTER TABLE "RestorantFoto"
ADD COLUMN vitrin BOOLEAN DEFAULT FALSE;

-- Her restoran için sadece bir vitrin fotoğraf olmalı
-- Trigger ile kontrol edelim
CREATE OR REPLACE FUNCTION check_single_vitrin()
RETURNS TRIGGER AS $$
BEGIN
    -- Eğer yeni fotoğraf vitrin olarak işaretleniyorsa
    IF NEW.vitrin = TRUE THEN
        -- Aynı restoranın diğer tüm fotoğraflarını vitrin olmayan yap
        UPDATE "RestorantFoto"
        SET vitrin = FALSE
        WHERE "restorantID" = NEW."restorantID" AND "fotoID" != NEW."fotoID";
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_single_vitrin
BEFORE INSERT OR UPDATE ON "RestorantFoto"
FOR EACH ROW
EXECUTE FUNCTION check_single_vitrin();
