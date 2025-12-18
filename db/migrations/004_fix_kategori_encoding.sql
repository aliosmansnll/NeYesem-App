-- Bozuk Türkçe karakterleri düzelt
-- Önce constraint'i kaldır
ALTER TABLE "RestorantMenu" DROP CONSTRAINT IF EXISTS check_menu_kategori;

-- Tüm bozuk kategorileri düzelt
UPDATE "RestorantMenu" 
SET kategoriad = 'Restorana Özel' 
WHERE kategoriad NOT IN ('Tatlı', 'Döner', 'Burger', 'Etli Ekmek', 'Restorana Özel');

-- Constraint'i tekrar ekle
ALTER TABLE "RestorantMenu" 
ADD CONSTRAINT check_menu_kategori 
CHECK (kategoriad IN ('Tatlı', 'Döner', 'Burger', 'Etli Ekmek', 'Restorana Özel'));
