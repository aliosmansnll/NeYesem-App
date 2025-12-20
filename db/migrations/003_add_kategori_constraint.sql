-- Menü kategorisi için sınırlama ekle

-- Önce mevcut geçersiz kategorileri 'Restorana Özel' yap
UPDATE "RestorantMenu" 
SET kategoriad = 'Restorana Özel' 
WHERE kategoriad IS NOT NULL 
AND kategoriad NOT IN ('Tatlı', 'Döner', 'Burger', 'Etli Ekmek', 'Restorana Özel');

-- Kategori alanına CHECK constraint ekle
ALTER TABLE "RestorantMenu" 
ADD CONSTRAINT check_menu_kategori 
CHECK (
    kategoriad IS NULL OR 
    kategoriad IN ('Tatlı', 'Döner', 'Burger', 'Etli Ekmek', 'Restorana Özel')
);
