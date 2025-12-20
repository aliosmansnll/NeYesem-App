# Database Migrations Archive

Bu klasör, geçmiş database migration dosyalarını içerir. 
Artık kullanılmıyor - tüm şema `../schema.sql` dosyasında birleştirildi.

## Migration Geçmişi

1. **001_add_cascade_delete.sql** - Foreign key cascade delete eklendi
2. **002_add_puan_constraint.sql** - Puan alanına constraint eklendi (1-5 arası)
3. **003_add_kategori_constraint.sql** - Menü kategorileri için constraint
4. **004_fix_kategori_encoding.sql** - Türkçe karakter düzeltmeleri
5. **005_add_vitrin_to_restoran_foto.sql** - Vitrin fotoğrafı özelliği eklendi
6. **006_add_city_district_to_restaurant.sql** - Şehir ve ilçe bilgileri eklendi
7. **007_add_tiktok_url.sql** - TikTok URL özelliği (deprecated)
8. **008_create_restoran_tiktok.sql** - RestorantTikTok tablosu oluşturuldu
9. **009_add_thumbnail_to_tiktok.sql** - TikTok thumbnail özelliği eklendi

## Yeni Proje İçin

Yeni bir veritabanı oluşturmak için `../schema.sql` dosyasını kullanın:

```bash
psql -U admin -d benimdb < db/schema.sql
```

Ya da Docker ile:

```bash
docker exec -i fastapi_postgres psql -U admin -d benimdb < db/schema.sql
```
