# NeYesem Mobile App 🍽️

React Native ile geliştirilmiş restoran ve menü değerlendirme uygulaması.

## 📱 Özellikler

- ✅ Kullanıcı kaydı ve girişi
- ✅ Restoranları listeleme
- ✅ Restoran detaylarını görüntüleme
- ✅ Menü öğelerini görüntüleme
- ✅ Restoran ve menü yorumları ekleme
- ✅ Puan verme sistemi (1-5 yıldız)
- ✅ Ortalama puan hesaplama

## 🛠️ Teknolojiler

- React Native (Expo)
- React Navigation
- Axios (API iletişimi)
- AsyncStorage (yerel veri saklama)
- Context API (state management)

## 📂 Proje Yapısı

```
mobile/
├── src/
│   ├── context/
│   │   └── AuthContext.js          # Kullanıcı kimlik doğrulama
│   ├── navigation/
│   │   └── AppNavigator.js         # Uygulama navigasyonu
│   ├── screens/
│   │   ├── LoginScreen.js          # Giriş ekranı
│   │   ├── RegisterScreen.js       # Kayıt ekranı
│   │   ├── HomeScreen.js           # Ana sayfa (restoran listesi)
│   │   ├── RestaurantDetailScreen.js  # Restoran detay
│   │   ├── MenuDetailScreen.js     # Menü detay
│   │   └── AddReviewScreen.js      # Yorum ekleme
│   └── services/
│       └── api.js                  # Backend API servisleri
├── App.js                          # Ana uygulama
└── package.json
```

## 🚀 Kurulum

### 1. Bağımlılıkları Yükle

```bash
cd mobile
npm install
```

### 2. Backend API Ayarları

`src/services/api.js` dosyasında API URL'ini düzenleyin:

- **Android Emulator için:** `http://10.0.2.2:8000`
- **iOS Simulator için:** `http://localhost:8000`
- **Fiziksel Cihaz için:** `http://[BİLGİSAYARIN_IP_ADRESİ]:8000`

Örnek:
```javascript
const API_URL = 'http://192.168.1.100:8000'; // Kendi IP adresinizi yazın
```

### 3. Backend'i Başlatın

Backend'in çalıştığından emin olun:
```bash
cd ..
docker-compose up
```

Backend: http://localhost:8000

### 4. Uygulamayı Başlatın

```bash
cd mobile
npm start
```

veya

```bash
npx expo start
```

## 📲 Çalıştırma Seçenekleri

- **Android Emulator:** `a` tuşuna basın
- **iOS Simulator:** `i` tuşuna basın (sadece Mac)
- **Fiziksel Cihaz:** Expo Go uygulamasıyla QR kodu tarayın

## 🔑 API Endpoint'leri

### Kullanıcı İşlemleri
- `POST /users/register` - Yeni kullanıcı kaydı
- `POST /users/login` - Kullanıcı girişi
- `GET /users/{id}` - Kullanıcı bilgisi

### Restoran İşlemleri
- `GET /restaurants/` - Tüm restoranlar
- `GET /restaurants/{id}` - Restoran detayı

### Menü İşlemleri
- `GET /menu/restaurant/{id}` - Restoran menüsü
- `GET /menu/{id}` - Menü öğesi detayı

### Yorum İşlemleri
- `POST /reviews/` - Yeni yorum ekle
- `GET /reviews/restaurant/{id}` - Restoran yorumları
- `GET /reviews/menu/{id}` - Menü yorumları

## 🎨 Ekran Görüntüleri

- **Login/Register:** Kullanıcı girişi ve kayıt ekranları
- **Home:** Restoran listesi
- **Restaurant Detail:** Menü ve yorumlar
- **Menu Detail:** Menü öğesi detayları ve yorumlar
- **Add Review:** Puan ve yorum ekleme

## 📝 Notlar

- Uygulama Expo kullanılarak geliştirilmiştir
- AsyncStorage ile kullanıcı oturumu saklanır
- Context API ile global state yönetimi yapılır
- React Navigation ile ekran geçişleri sağlanır

## 🐛 Sorun Giderme

### Backend'e bağlanamıyorum
1. Backend'in çalıştığından emin olun (`docker-compose up`)
2. `api.js` dosyasındaki API_URL'i kontrol edin
3. Firewall ayarlarını kontrol edin
4. Android emulator için 10.0.2.2 kullanın

### Paket yükleme hataları
```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
```

### Expo başlamıyor
```bash
npm install -g expo-cli
npx expo start --clear
```

## 👨‍💻 Geliştirme

Geliştirme sırasında hot reload aktiftir. Dosyaları düzenledikçe değişiklikler otomatik yansır.

## 📦 Build

Production build için:
```bash
npx expo build:android
npx expo build:ios
```

## 🔗 Bağlantılar

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
