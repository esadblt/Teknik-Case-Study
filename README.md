# 8D Problem Cozme Platformu (MVP)

## 1. Proje Ozeti

Bu proje, uretim hatlarinda yasanan problemleri takip etmek ve kok nedenlerini analiz etmek amaciyla "8D Problem Cozme Metodolojisi"ni dijitallestirmektedir. Proje, "Problem Tanimlama (D1-D2)" ve "Kok Neden Analizi (D4-D5)" sureclerini simule eden bir Full Stack prototip (MVP) olarak gelistirilmistir.

Calisma, Siemens iX tasarim sistemine uyum saglamakta ve PHP ile iliskisel veri yapilarini (Recursive/Tree Data) modellemektedir.

## 2. Teknoloji Yigini (Tech Stack)

### Frontend
- **Framework:** React 18
- **UI Kutuphanesi:** Siemens iX Design System (@siemens/ix-react v4.2.0)
- **Tablo Bileseni:** AG-Grid Community
- **Build Araci:** Vite
- **Yonlendirme:** React Router DOM

### Backend
- **Dil:** PHP 8.x (Native)
- **API:** RESTful JSON API
- **Guvenlik:** Prepared Statements, Input Validation, CORS Headers

### Veritabani
- **Sistem:** MySQL
- **Veritabani Adi:** 8d_problem_solving

## 3. Fonksiyonel Gereksinimler ve Durum

### Bolum A: Dashboard (Problem Listesi ve Tanimlama)

| Gereksinim | Durum | Aciklama |
|------------|-------|----------|
| Problem listesi tablosu | Tamamlandi | AG-Grid ile ID, Baslik, Sorumlu, Ekip, Durum, Termin, Tarih sutunlari |
| Yeni Problem Ekle butonu | Tamamlandi | Dashboard header'da yer almaktadir |
| Modal ile problem kaydi | Tamamlandi | Siemens IX Modal ve showModal utility kullanilmaktadir |
| Form alanlari (D1-D2) | Tamamlandi | Baslik, Aciklama, Sorumlu Kisi, Ekip, Durum, Termin alanlari mevcut |
| Durum gosterimi (Acik/Kapali) | Tamamlandi | IX-Pill bileseni ile alarm/success renkleri |

### Bolum B: Kok Neden Analizi (D4-D5)

| Gereksinim | Durum | Aciklama |
|------------|-------|----------|
| Dinamik Kok Neden Agaci | Tamamlandi | Recursive tree yapisi ile sinirsiz derinlik destegi |
| "Neden?" sorusu ile alt sebep ekleme | Tamamlandi | Her dugume alt dugum eklenebilmektedir |
| Hiyerarsik gorsellestirme | Tamamlandi | Girintili tree yapisi ile gosterim |
| Kok Neden isaretleme | Tamamlandi | Checkbox ile herhangi bir dal kok neden olarak isaretlenebilir |
| Kalici Cozum Aksiyonu (D6) | Tamamlandi | Isaretlenen kok neden icin aksiyon plani girisi |
| Otomatik durum guncelleme | Tamamlandi | Kalici cozum tanimlandiginda problem "Kapali" durumuna gecer |

## 4. Veritabani Yapisi

### problems Tablosu
```sql
CREATE TABLE problems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    responsible_person VARCHAR(100) NOT NULL,
    team VARCHAR(100),
    deadline DATE,
    status ENUM('OPEN', 'CLOSED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### root_causes Tablosu
```sql
CREATE TABLE root_causes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    problem_id INT NOT NULL,
    parent_id INT DEFAULT NULL,
    description TEXT NOT NULL,
    is_root_cause TINYINT(1) DEFAULT 0,
    action_plan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES root_causes(id) ON DELETE CASCADE
);
```

## 5. API Endpoint'leri

### Problems API (/api/problems.php)

| Method | Endpoint | Aciklama |
|--------|----------|----------|
| GET | /api/problems.php | Tum problemleri listeler |
| GET | /api/problems.php?id={id} | Belirli bir problemi getirir |
| POST | /api/problems.php | Yeni problem olusturur |
| PUT | /api/problems.php?id={id} | Problemi gunceller |
| DELETE | /api/problems.php?id={id} | Problemi siler |

### Root Causes API (/api/root_causes.php)

| Method | Endpoint | Aciklama |
|--------|----------|----------|
| GET | /api/root_causes.php?problem_id={id} | Kok neden agacini getirir (tree format) |
| POST | /api/root_causes.php | Yeni kok neden ekler |
| PUT | /api/root_causes.php | Kok nedeni gunceller |
| DELETE | /api/root_causes.php?id={id} | Kok nedeni siler (cascade) |

## 6. Proje Dizin Yapisi

```
8d-projects/
├── backend/
│   ├── api/
│   │   ├── problems.php
│   │   └── root_causes.php
│   └── config/
│       └── database.php
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Dashboard.css
│   │   │   ├── ProblemDetail.jsx
│   │   │   ├── ProblemDetail.css
│   │   │   ├── ProblemModal.jsx
│   │   │   ├── ProblemModal.css
│   │   │   ├── RootCauseTree.jsx
│   │   │   ├── RootCauseTree.css
│   │   │   ├── TreeNode.jsx
│   │   │   └── TreeNode.css
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── problemService.js
│   │   │   └── rootCauseService.js
│   │   ├── hooks/
│   │   │   ├── useAlert.js
│   │   │   └── useIxButtonStyles.js
│   │   ├── styles/
│   │   │   └── ix-overrides.css
│   │   ├── utils/
│   │   │   └── toast.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 7. Kurulum ve Calistirma

### Gereksinimler
- Node.js 18 veya ustu
- PHP 8.x
- MySQL 5.7 veya ustu
- XAMPP veya benzeri yerel sunucu

### Veritabani Kurulumu

1. MySQL'de `8d_problem_solving` adinda bir veritabani olusturun.

2. Asagidaki SQL komutlarini calistirin:

```sql
CREATE DATABASE IF NOT EXISTS 8d_problem_solving;
USE 8d_problem_solving;

CREATE TABLE problems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    responsible_person VARCHAR(100) NOT NULL,
    team VARCHAR(100),
    deadline DATE,
    status ENUM('OPEN', 'CLOSED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE root_causes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    problem_id INT NOT NULL,
    parent_id INT DEFAULT NULL,
    description TEXT NOT NULL,
    is_root_cause TINYINT(1) DEFAULT 0,
    action_plan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES root_causes(id) ON DELETE CASCADE
);
```

### Backend Kurulumu

1. Proje klasorunu XAMPP htdocs dizinine kopyalayin:
```
C:\xampp\htdocs\8d-projects
```

2. Apache servisini baslatin.

3. `backend/config/database.php` dosyasinda veritabani bilgilerini kontrol edin.

### Frontend Kurulumu

1. Frontend dizinine gidin:
```bash
cd frontend
```

2. Bagimliliklari yukleyin:
```bash
npm install
```

3. Gelistirme sunucusunu baslatin:
```bash
npm run dev
```

4. Tarayicida `http://localhost:5173` adresine gidin.

## 8. Kullanim Kilavuzu

### Problem Olusturma
1. Dashboard ekraninda "Yeni Problem Ekle" butonuna tiklayin.
2. Acilan modal'da problem bilgilerini girin.
3. "Kaydet" butonuna tiklayin.

### Kok Neden Analizi
1. Listeden bir probleme tiklayin.
2. "Kok Neden Analizi (D4-D5)" sekmesine gecin.
3. Ilk nedeni girin ve "Baslat" butonuna tiklayin.
4. Her neden icin "Neden?" butonuna tiklayarak alt nedenler ekleyin.
5. Kok nedeni bulduguzda "Kok Neden" kutusunu isaretleyin.
6. Kalici cozum aksiyonunu yazin ve "Kaydet" butonuna tiklayin.
7. Problem otomatik olarak "Kapali" durumuna gecer.

## 9. Bilinen Kisitlamalar ve Gelecek Gelistirmeler

### Mevcut Kisitlamalar
- Kullanici kimlik dogrulama sistemi bulunmamaktadir.
- D3 (Gecici Onlemler), D7 (Onleyici Faaliyetler) ve D8 (Ekip Tebrik) adimlari henuz uygulanmamistir.
- Raporlama ve istatistik modulu mevcut degildir.
- Dosya ekleme ozelligi bulunmamaktadir.

### Gelecek Gelistirmeler
- Kullanici yetkilendirme ve rol yonetimi
- 8D metodolojisinin tum adimlarinin uygulanmasi
- Dashboard'da istatistik kartlari ve grafikler
- PDF rapor olusturma
- E-posta bildirimleri
- Coklu dil destegi

## 10. Siemens iX Bilesenlerinin Kullanimi

Projede asagidaki Siemens iX bilesenleri kullanilmaktadir:

| Bilesen | Kullanim Alani |
|---------|----------------|
| IxApplication | Ana uygulama cercevesi |
| IxApplicationHeader | Uygulama basligi |
| IxMenu, IxMenuItem | Sol navigasyon menusu |
| IxContentHeader | Sayfa basliklari |
| IxButton, IxIconButton | Butonlar |
| IxModal, IxModalHeader, IxModalContent, IxModalFooter | Modal pencereleri |
| IxInput, IxTextarea, IxSelect, IxDateInput | Form elemanlari |
| IxPill | Durum gostergeleri |
| IxCard, IxCardContent | Bilgi kartlari |
| IxTabs, IxTabItem | Sekme navigasyonu |
| IxSpinner | Yukleme gostergesi |
| IxMessageBar | Bildirim mesajlari |
| IxCheckbox | Onay kutulari |
| IxTypography | Metin bicimlendirme |

## 11. Lisans

Bu proje egitim ve degerlendirme amaciyla gelistirilmistir.

## 12. Iletisim

Proje ile ilgili sorulariniz icin iletisime gecebilirsiniz.
