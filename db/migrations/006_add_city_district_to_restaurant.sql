-- Restoran tablosuna şehir ve ilçe/bölge bilgisi ekleme
ALTER TABLE "RestorantHesap"
ADD COLUMN sehir VARCHAR(50),
ADD COLUMN ilce VARCHAR(50);

-- Index ekle (arama performansı için)
CREATE INDEX idx_restorant_sehir ON "RestorantHesap"(sehir);
CREATE INDEX idx_restorant_ilce ON "RestorantHesap"(ilce);
