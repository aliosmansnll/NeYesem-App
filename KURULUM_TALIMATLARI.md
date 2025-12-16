# NeYesem App - Kurulum Talimatları 📱

## ✅ Tamamlanan İşlemler

1. ✅ React Native (Expo) projesi oluşturuldu
2. ✅ Proje klasör yapısı kuruldu
3. ✅ Gerekli paketler package.json'a eklendi
4. ✅ API servis katmanı oluşturuldu
5. ✅ Authentication sistemi (Context API) kuruldu
6. ✅ Tüm ekranlar oluşturuldu:
   - LoginScreen
   - RegisterScreen
   - HomeScreen (Restoran Listesi)
   - RestaurantDetailScreen
   - MenuDetailScreen
   - AddReviewScreen
7. ✅ React Navigation yapılandırıldı
8. ✅ App.js güncellendi

## 🚀 Sonraki Adımlar

### 1. Paketleri Yükle

**CMD veya PowerShell'de çalıştırın:**

```bash
cd "c:\Users\alios\OneDrive\Desktop\NeYesem App Setup\mobile"
npm install
```

Bu işlem 2-3 dakika sürebilir.

### 2. Backend API URL'ini Ayarla

Cihazınıza göre API URL'ini düzenleyin:

**Dosya:** `mobile\src\services\api.js` (Satır 8-9)

```javascript
// Android Emulator için:
const API_URL = 'http://10.0.2.2:8000';

// iOS Simulator için:
const API_URL = 'http://localhost:8000';

// Fiziksel telefon için (bilgisayarınızın IP adresini kullanın):
const API_URL = 'http://192.168.1.100:8000'; // Örnek IP
```

**IP Adresinizi Bulmak İçin:**

Windows CMD'de çalıştırın:
```bash
ipconfig
```
"IPv4 Address" değerini kullanın (örn: 192.168.1.100)

### 3. Backend'i Başlatın

Backend'in çalıştığından emin olun:

```bash
cd "c:\Users\alios\OneDrive\Desktop\NeYesem App Setup"
docker-compose up
```

Backend şu adreste çalışacak: http://localhost:8000

### 4. Uygulamayı Başlatın

Yeni bir terminal açın:

```bash
cd "c:\Users\alios\OneDrive\Desktop\NeYesem App Setup\mobile"
npm start
```

veya

```bash
npx expo start
```

### 5. Uygulamayı Çalıştırın

**Seçenek A - Android Emulator:**
- Terminal'de `a` tuşuna basın
- Veya Android Studio'dan bir emulator başlatın

**Seçenek B - iOS Simulator (Sadece Mac):**
- Terminal'de `i` tuşuna basın

**Seçenek C - Fiziksel Telefon:**
- Google Play veya App Store'dan "Expo Go" uygulamasını indirin
- Terminal'de görünen QR kodu Expo Go ile tarayın
- **ÖNEMLİ:** Telefon ve bilgisayar aynı WiFi ağında olmalı!

## 📱 Uygulama Özellikleri

### Kullanıcı İşlemleri
- ✅ Kayıt ol
- ✅ Giriş yap
- ✅ Oturum yönetimi (AsyncStorage)

### Restoran İşlemleri
- ✅ Tüm restoranları listele
- ✅ Restoran detaylarını görüntüle
- ✅ Restoran menüsünü görüntüle
- ✅ Restoran yorumlarını görüntüle

### Yorum İşlemleri
- ✅ Restorana yorum yap
- ✅ Menü öğesine yorum yap
- ✅ 1-5 arası puan ver
- ✅ Ortalama puanı görüntüle

## 🎨 Ekran Akışı

```
[Giriş Yap] → [Ana Sayfa (Restoranlar)]
     ↓
[Kayıt Ol] → [Ana Sayfa (Restoranlar)]
                    ↓
            [Restoran Detay] → [Yorum Ekle]
                    ↓
            [Menü Detay] → [Yorum Ekle]
```

## 🐛 Sorun Giderme

### "Cannot connect to backend" hatası:
1. Backend çalışıyor mu kontrol edin: http://localhost:8000
2. `api.js` dosyasındaki API_URL doğru mu?
3. Fiziksel cihaz kullanıyorsanız IP adresi doğru mu?
4. Telefon ve PC aynı WiFi'de mi?

### Paket yükleme hatası:
```bash
cd mobile
rm -rf node_modules
npm cache clean --force
npm install
```

### Expo başlamıyor:
```bash
npm install -g expo-cli
npx expo start --clear
```

## 📝 Test Senaryosu

1. **Kayıt Ol:**
   - Ad: Test
   - Soyad: Kullanıcı
   - Email: test@example.com
   - Şifre: 123456

2. **Ana Sayfa:**
   - Restoranları görüntüle
   - Bir restorana tıkla

3. **Restoran Detay:**
   - Menü sekmesini gör
   - Yorumlar sekmesini gör
   - Yorum ekle butonuna tıkla

4. **Yorum Ekle:**
   - 5 yıldız ver
   - Yorum yaz
   - Gönder

5. **Menü Detay:**
   - Bir menü öğesine tıkla
   - Yorumları gör
   - Yorum ekle

## 🎉 Başarılı Kurulum Kontrolü

Eğer şunları görebiliyorsanız kurulum başarılı:
- ✅ Giriş ekranı açılıyor
- ✅ Kayıt olabiliyorsunuz
- ✅ Restoranlar listeleniyor
- ✅ Restoran detaylarını görebiliyorsunuz
- ✅ Yorum ekleyebiliyorsunuz

## 📞 Yardım

Sorun yaşarsanız:
1. Terminal loglarını kontrol edin
2. Backend loglarını kontrol edin
3. Console hatalarına bakın
4. README.md dosyasını okuyun

---

**İyi kodlamalar! 🚀**
