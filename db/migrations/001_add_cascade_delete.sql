-- Menü silindiğinde ilgili fotoğrafları da sil
ALTER TABLE "MenuFoto"
DROP CONSTRAINT IF EXISTS menufoto_menuid_fkey,
ADD CONSTRAINT menufoto_menuid_fkey 
    FOREIGN KEY ("menuID") 
    REFERENCES "RestorantMenu"("menuID") 
    ON DELETE CASCADE;

-- Restoran silindiğinde menüleri de sil
ALTER TABLE "RestorantMenu"
DROP CONSTRAINT IF EXISTS restorantmenu_restorantid_fkey,
ADD CONSTRAINT restorantmenu_restorantid_fkey 
    FOREIGN KEY ("restorantID") 
    REFERENCES "RestorantHesap"("restorantID") 
    ON DELETE CASCADE;

-- Restoran silindiğinde fotoğrafları da sil
ALTER TABLE "RestorantFoto"
DROP CONSTRAINT IF EXISTS restorantfoto_restorantid_fkey,
ADD CONSTRAINT restorantfoto_restorantid_fkey 
    FOREIGN KEY ("restorantID") 
    REFERENCES "RestorantHesap"("restorantID") 
    ON DELETE CASCADE;

-- Kullanıcı silindiğinde yorumları da sil
ALTER TABLE "Yorum"
DROP CONSTRAINT IF EXISTS yorum_kullaniciid_fkey,
ADD CONSTRAINT yorum_kullaniciid_fkey 
    FOREIGN KEY ("kullaniciID") 
    REFERENCES "KullaniciHesap"("kullaniciID") 
    ON DELETE CASCADE;

-- Restoran silindiğinde yorumları da sil
ALTER TABLE "Yorum"
DROP CONSTRAINT IF EXISTS yorum_restorantid_fkey,
ADD CONSTRAINT yorum_restorantid_fkey 
    FOREIGN KEY ("restorantID") 
    REFERENCES "RestorantHesap"("restorantID") 
    ON DELETE CASCADE;
