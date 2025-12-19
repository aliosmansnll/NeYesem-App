# TikTok Video Özelliği Eklendi 🎥

## ✅ Yapılan İyileştirmeler

### 1. **Veritabanı**
- ✅ Migration oluşturuldu: [007_add_tiktok_url.sql](db/migrations/007_add_tiktok_url.sql)
- ✅ `RestorantHesap` tablosuna `tiktokURL` sütunu eklendi (VARCHAR 500)
- ✅ URL formatı için constraint eklendi

### 2. **Backend**
- ✅ [models.py](backend/app/models.py) - RestorantHesap modeline `tiktokURL` alanı eklendi
- ✅ [schemas.py](backend/app/schemas.py) - RestorantBase schema'sına `tiktokURL` eklendi
- ✅ [restaurants.py](backend/app/routers/restaurants.py) - Yeni `PUT /restaurants/{id}` endpoint'i eklendi

### 3. **Frontend**
- ✅ [api.js](mobile/src/services/api.js) - `updateRestaurant` fonksiyonu eklendi
- ✅ [RestaurantEditScreen.js](mobile/src/screens/RestaurantEditScreen.js):
  - TikTok URL input alanı eklendi
  - Güncelleme fonksiyonu implement edildi
- ✅ [RestaurantDetailScreen.js](mobile/src/screens/RestaurantDetailScreen.js):
  - TikTok sekmesi eklendi (sadece video varsa görünür)
  - WebView ile TikTok videosu gösterimi
  - "TikTok'ta Aç" butonu

## 🚀 Kurulum Adımları

### 1. Veritabanı Migration'ını Çalıştır

Docker container'ına bağlan ve migration'ı çalıştır:

```bash
# Container'a gir
docker exec -it neyesem-db psql -U postgres -d neyesemdb

# Migration'ı çalıştır
\i /docker-entrypoint-initdb.d/migrations/007_add_tiktok_url.sql

# Kontrol et
\d RestorantHesap

# Çıkış
\q
```

**VEYA** SQL dosyasını manuel çalıştır:
```sql
ALTER TABLE RestorantHesap 
ADD COLUMN tiktokURL VARCHAR(500);

ALTER TABLE RestorantHesap 
ADD CONSTRAINT chk_tiktok_url 
CHECK (tiktokURL IS NULL OR tiktokURL LIKE 'http%');
```

### 2. Backend'i Yeniden Başlat

```bash
# Docker container'ı yeniden başlat
docker-compose restart backend
```

### 3. Mobil Uygulamayı Test Et

```bash
cd mobile
npx expo start --clear
```

## 📱 Kullanım

### Restoran Sahibi:
1. **Profil Düzenle** ekranına git
2. "TikTok Video URL" alanına video linkini yapıştır
   - Örnek: `https://www.tiktok.com/@username/video/1234567890`
3. **Güncelle** butonuna bas

### Kullanıcı:
1. Restoran detay sayfasına git
2. **TikTok** sekmesi görünüyorsa tıkla
3. Video WebView içinde oynatılır
4. **"TikTok'ta Aç"** butonuyla TikTok uygulamasında açılabilir

## 🎯 Özellikler

- ✅ TikTok URL'si varsa otomatik sekme görünür
- ✅ WebView ile video embed edilir
- ✅ Loading indicator
- ✅ "TikTok'ta Aç" butonu
- ✅ Responsive tasarım
- ✅ Opsiyonel alan (zorunlu değil)

## 📝 Notlar

- TikTok video URL'si zorunlu değil, restoranlar isteğe bağlı ekleyebilir
- URL formatı `http` veya `https` ile başlamalı
- WebView Android ve iOS'da çalışır
- İnternet bağlantısı gerektirir

## 🔄 Güncelleme Akışı

```
Restoran → Profil Düzenle → TikTok URL Gir → Güncelle
     ↓
Veritabanı
     ↓
Kullanıcı → Restoran Detay → TikTok Sekmesi → Video İzle
```
