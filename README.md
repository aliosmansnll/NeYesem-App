# 🍽️ NeYesem - Restoran Keşif ve Değerlendirme Uygulaması

NeYesem, kullanıcıların yakınlarındaki restoranları keşfetmelerine, menüleri incelemelerine ve deneyimlerini paylaşmalarına olanak tanıyan modern bir mobil uygulamadır.

## 📱 Özellikler

### Kullanıcı Özellikleri
- 🌍 **GPS Tabanlı Arama** - Konumunuza göre yakındaki restoranları keşfedin
- 🔍 **Akıllı Filtreleme** - Şehir ve ilçe bazlı restoran arama
- ⭐ **Değerlendirme Sistemi** - 5 yıldızlı puan sistemi
- 📸 **Fotoğraf Paylaşımı** - Yemek ve restoran fotoğrafları yükleyin
- 💬 **Yorum Yapma** - Deneyimlerinizi diğer kullanıcılarla paylaşın
- 📱 **TikTok Entegrasyonu** - Restoran TikTok videolarını izleyin
- 🗺️ **Harita Görünümü** - Restoran konumlarını harita üzerinde görüntüleyin

### Restoran Özellikleri
- 🏪 **Restoran Yönetimi** - İşletmenizi kolayca yönetin
- 📋 **Menü Yönetimi** - Menünüzü oluşturun ve güncelleyin
- 🖼️ **Fotoğraf Galerisi** - Vitrin fotoğrafı ve galeri yönetimi
- 📊 **İstatistikler** - Değerlendirme ve yorum istatistikleri
- 🎥 **TikTok Videoları** - İşletmenizin TikTok videolarını ekleyin

## 🛠️ Teknoloji Stack

### Frontend (Mobile)
- **React Native** (0.81.5) - Cross-platform mobil uygulama
- **Expo** (~54.0) - Geliştirme ve deployment framework
- **React Navigation** - Uygulama navigasyonu
- **Context API** - State yönetimi
- **Axios** - HTTP istekleri
- **Expo Location** - GPS ve konum servisleri
- **Expo Image Picker** - Fotoğraf yükleme
- **React Native WebView** - Harita entegrasyonu

### Backend (API)
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM (Object-Relational Mapping)
- **PostgreSQL 16** - İlişkisel veritabanı
- **Pydantic** - Veri validasyonu
- **Uvicorn** - ASGI server
- **Pillow** - Görüntü işleme
- **HTTPX** - Asenkron HTTP client

### DevOps
- **Docker** - Konteynerizasyon
- **Docker Compose** - Multi-container orkestrasyon
- **pgAdmin** - PostgreSQL yönetim arayüzü

## 📋 Gereksinimler

### Genel
- **Git** - Versiyon kontrol sistemi
- **Docker Desktop** - Konteyner yönetimi
- **Node.js** (v16 veya üzeri) - JavaScript runtime

### Mobil Geliştirme
- **Expo Go** uygulaması (iOS/Android cihazınızda)
- **Android Studio** veya **Xcode** (emülatör için)

## 🚀 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/kullaniciadi/neyesem.git
cd neyesem
```

### 2. Environment Değişkenlerini Ayarlayın

#### Backend için:
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin ve güvenli şifreler belirleyin:
```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=benimdb
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=your_secure_password
```

#### Mobile için:
```bash
cd mobile
cp .env.example .env
```

Bilgisayarınızın IP adresini öğrenin:
- **Windows**: `ipconfig` komutunu çalıştırın
- **Mac/Linux**: `ifconfig` komutunu çalıştırın

`mobile/src/services/api.js` dosyasında API_URL'yi güncelleyin:
```javascript
const API_URL = 'http://YOUR_COMPUTER_IP:8000';
```

### 3. Docker ile Backend'i Başlatın

```bash
# Proje ana dizininde
docker-compose up -d
```

Bu komut şunları başlatır:
- PostgreSQL veritabanı (port 5432)
- FastAPI backend (port 8000)
- pgAdmin web arayüzü (port 5050)

Backend'in çalıştığını kontrol edin:
```bash
# Tarayıcıda açın
http://localhost:8000/docs
```

### 4. Mobil Uygulamayı Başlatın

```bash
cd mobile
npm install
npx expo start
```

Expo QR kodunu tarayın:
- **iOS**: Camera uygulaması ile
- **Android**: Expo Go uygulaması ile

## 📱 Kullanım

### Kullanıcı Hesabı
1. Uygulamayı açın
2. "Kayıt Ol" butonuna tıklayın
3. Bilgilerinizi girin ve kayıt olun
4. Giriş yapın ve restoranları keşfetmeye başlayın

### Restoran Hesabı
1. Karşılama ekranından "Restoran Olarak Giriş" seçin
2. "Kayıt Ol" ile işletmenizi kaydedin
3. Harita üzerinde konumunuzu seçin
4. Menü, fotoğraf ve TikTok videoları ekleyin

## 🗄️ Veritabanı Yönetimi

pgAdmin web arayüzüne erişim:
```
URL: http://localhost:5050
Email: .env dosyasındaki PGADMIN_DEFAULT_EMAIL
Password: .env dosyasındaki PGADMIN_DEFAULT_PASSWORD
```

Yeni sunucu eklemek için:
- Host: `postgres`
- Port: `5432`
- Username: `.env` dosyasındaki POSTGRES_USER
- Password: `.env` dosyasındaki POSTGRES_PASSWORD

## 🔧 Geliştirme

### Backend API'ye Erişim
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Database Migrasyonları
Yeni database oluşturmak için:
```bash
# Docker kullanarak
docker exec -i fastapi_postgres psql -U admin -d benimdb < db/schema.sql

# Veya yerel PostgreSQL ile
psql -U admin -d benimdb < db/schema.sql
```

Migration geçmişi için `db/migrations/README.md` dosyasına bakın.

### Hot Reload
- **Frontend**: Expo otomatik olarak değişiklikleri yeniler
- **Backend**: FastAPI otomatik reload destekler

## 📂 Proje Yapısı

```
neyesem/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── routers/        # API endpoint'leri
│   │   ├── models.py       # SQLAlchemy modelleri
│   │   ├── schemas.py      # Pydantic şemaları
│   │   ├── db.py           # Database bağlantısı
│   │   └── utils.py        # Yardımcı fonksiyonlar
│   ├── uploads/            # Yüklenen dosyalar
│   ├── Dockerfile
│   └── requirements.txt
├── mobile/                  # React Native Frontend
│   ├── src/
│   │   ├── components/     # Yeniden kullanılabilir bileşenler
│   │   ├── screens/        # Uygulama ekranları
│   │   ├── services/       # API servisleri
│   │   ├── context/        # Context API
│   │   ├── navigation/     # Navigation yapılandırması
│   │   ├── theme/          # Renk ve stil temaları
│   │   └── utils/          # Yardımcı fonksiyonlar
│   ├── assets/             # Görseller ve kaynaklar
│   └── package.json
├── db/                      # Database
│   ├── schema.sql          # Complete database schema
│   ├── init.sql            # Docker initialization (legacy)
│   └── migrations/         # Migration history (archived)
├── docker-compose.yml       # Docker orkestrasyon
├── .env.example            # Environment değişkenleri örneği
├── .gitignore
└── README.md
```

## 🐛 Sorun Giderme

### Docker başlatma sorunları
```bash
# Container'ları durdurun ve temizleyin
docker-compose down
docker-compose up -d --build
```

### Expo bağlantı sorunları
- Bilgisayar ve telefon aynı WiFi ağında olmalı
- Güvenlik duvarı Expo portlarına (8081, 8082) izin vermeli
- API_URL'nin doğru IP adresini gösterdiğinden emin olun

### Database bağlantı hataları
- Docker container'ların çalıştığını kontrol edin: `docker ps`
- `.env` dosyasındaki bilgilerin doğru olduğundan emin olun
- Backend loglarını kontrol edin: `docker logs fastapi_backend`

## 📝 API Dokümantasyonu

Tüm API endpoint'leri ve şemaları için Swagger UI'ye bakın:
http://localhost:8000/docs

### Temel Endpoint'ler

#### Kullanıcı İşlemleri
- `POST /users/register` - Yeni kullanıcı kaydı
- `POST /users/login` - Kullanıcı girişi

#### Restoran İşlemleri
- `GET /restaurants/` - Tüm restoranları listele
- `GET /restaurants/{id}` - Restoran detayları
- `POST /restaurants/register` - Yeni restoran kaydı
- `PUT /restaurants/{id}` - Restoran güncelle

#### Menü İşlemleri
- `GET /menu/restaurant/{id}` - Restoran menüsü
- `POST /menu/` - Yeni menü öğesi ekle
- `PUT /menu/{id}` - Menü öğesi güncelle
- `DELETE /menu/{id}` - Menü öğesi sil

#### Yorum İşlemleri
- `GET /reviews/restaurant/{id}` - Restoran yorumları
- `POST /reviews/` - Yeni yorum ekle

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!
