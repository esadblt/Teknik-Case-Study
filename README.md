# 8D Problem Çözme Platformu (MVP)

## 1. Proje Özeti

Bu proje, üretim hatlarında yaşanan problemleri takip etmek ve kök nedenlerini analiz etmek amacıyla "8D Problem Çözme Metodolojisi"ni dijitalleştirmektedir. Proje, "Problem Tanımlama (D1-D2)" ve "Kök Neden Analizi (D4-D5)" süreçlerini simüle eden bir Full Stack prototip (MVP) olarak geliştirilmiştir.

Çalışma, Siemens iX tasarım sistemine uyum sağlamakta ve PHP ile ilişkisel veri yapılarını (Recursive/Tree Data) modellemektedir.

## 2. Teknoloji Yığını (Tech Stack)

### Frontend
- **Framework:** React 18
- **UI Kütüphanesi:** Siemens iX Design System (@siemens/ix-react)
- **Tablo Bileşeni:** AG-Grid Community + Siemens IX AG-Grid Theme
- **Build Aracı:** Vite
- **Yönlendirme:** React Router DOM

### Backend
- **Dil:** PHP 8.x (Native)
- **API:** RESTful JSON API
- **Güvenlik:** Prepared Statements, Input Validation, CORS Headers

### Veritabanı
- **Sistem:** MySQL
- **Veritabanı Adı:** 8d_problem_solving

## 3. Özellikler

### ✅ Dashboard (Problem Listesi)
- AG-Grid ile problem listesi (ID, Başlık, Sorumlu, Ekip, Durum, Termin, Tarih)
- Siemens IX AG-Grid teması ile özelleştirilmiş tablo görünümü
- Türkçe tarih formatı (GG.AA.YYYY)
- Responsive tasarım (mobil, tablet, masaüstü)
- Yeni Problem Ekle modal penceresi

### ✅ Problem Detay Sayfası
- Problem bilgileri görüntüleme ve düzenleme
- 8D metodolojisi sekmeleri (Genel Bakış, Kök Neden Analizi)
- Durum gösterimi (Açık/Kapalı)

### ✅ Kök Neden Analizi (5 Neden - Why-Why)
- Dinamik ağaç yapısı ile sınırsız derinlik
- Her düğüme alt neden ekleme
- Kök neden işaretleme
- Kalıcı Çözüm Aksiyonu (D6) tanımlama
- Otomatik durum güncelleme

### ✅ Tema Desteği
- Aydınlık ve karanlık tema geçişi
- Sistem tercihini algılama
- Tema tercihinin localStorage'da saklanması

### ✅ Erişilebilirlik (WCAG AA)
- Türkçe dil kodu (lang="tr")
- Skip-to-main-content bağlantısı
- ARIA etiketleri ve roller
- Klavye navigasyonu
- Screen reader desteği
- Yüksek kontrast modu desteği
- Hareket azaltma tercihi desteği
- Tooltip'ler (açıklayıcı ipuçları)

### ✅ Responsive Tasarım
- Mobil uyumlu (576px altı)
- Tablet uyumlu (768px altı)
- Touch cihaz optimizasyonları
- Safe area inset desteği (notch)
- Yazdırma stilleri

## 4. Proje Dizin Yapısı

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
│   │   ├── favicon.svg
│   │   └── siemens-ag-logo.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   └── Dashboard.css
│   │   │   ├── ProblemDetail/
│   │   │   │   ├── ProblemDetail.jsx
│   │   │   │   └── ProblemDetail.css
│   │   │   ├── ProblemModal/
│   │   │   │   ├── ProblemModal.jsx
│   │   │   │   └── ProblemModal.css
│   │   │   ├── RootCauseTree/
│   │   │   │   ├── RootCauseTree.jsx
│   │   │   │   └── RootCauseTree.css
│   │   │   └── TreeNode/
│   │   │       ├── TreeNode.jsx
│   │   │       └── TreeNode.css
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── problemService.js
│   │   │   └── rootCauseService.js
│   │   ├── hooks/
│   │   │   └── useAlert.js
│   │   ├── utils/
│   │   │   ├── toast.js
│   │   │   └── accessibility.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 5. Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18 veya üstü
- PHP 8.x
- MySQL 5.7 veya üstü
- XAMPP veya benzeri yerel sunucu

### Veritabanı Kurulumu

1. MySQL'de `8d_problem_solving` adında bir veritabanı oluşturun.

2. Aşağıdaki SQL komutlarını çalıştırın:

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

1. Proje klasörünü XAMPP htdocs dizinine kopyalayın:
```
C:\xampp\htdocs\8d-projects
```

2. Apache servisini başlatın.

3. `backend/config/database.php` dosyasında veritabanı bilgilerini kontrol edin.

### Frontend Kurulumu

1. Frontend dizinine gidin:
```bash
cd frontend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

4. Tarayıcıda `http://localhost:5173` adresine gidin.

## 6. API Endpoint'leri

### Problems API (/api/problems.php)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/problems.php | Tüm problemleri listeler |
| GET | /api/problems.php?id={id} | Belirli bir problemi getirir |
| POST | /api/problems.php | Yeni problem oluşturur |
| PUT | /api/problems.php?id={id} | Problemi günceller |
| DELETE | /api/problems.php?id={id} | Problemi siler |

### Root Causes API (/api/root_causes.php)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/root_causes.php?problem_id={id} | Kök neden ağacını getirir |
| POST | /api/root_causes.php | Yeni kök neden ekler |
| PUT | /api/root_causes.php | Kök nedeni günceller |
| DELETE | /api/root_causes.php?id={id} | Kök nedeni siler |

## 7. Siemens iX Bileşenlerinin Kullanımı

| Bileşen | Kullanım Alanı |
|---------|----------------|
| IxApplication | Ana uygulama çerçevesi |
| IxApplicationHeader | Uygulama başlığı ve tema değiştirici |
| IxMenu, IxMenuItem, IxMenuCategory | Sol navigasyon menüsü |
| IxContentHeader | Sayfa başlıkları |
| IxButton, IxIconButton | Butonlar |
| IxModal, showModal | Modal pencereleri |
| IxInput, IxTextarea, IxDateInput | Form elemanları |
| IxPill | Durum göstergeleri |
| IxCard | Bilgi kartları |
| IxTabs, IxTabItem | Sekme navigasyonu |
| IxSpinner | Yükleme göstergesi |
| IxMessageBar | Bildirim mesajları |
| IxCheckbox | Onay kutuları |
| IxTooltip | Açıklayıcı ipuçları |
| IxIcon | İkonlar |

## 8. Erişilebilirlik Özellikleri

Proje, Siemens IX Accessibility Guidelines'a uygun olarak geliştirilmiştir:

- **HTML lang="tr"**: Türkçe dil kodu
- **Skip Link**: Klavye kullanıcıları için içeriğe atlama
- **ARIA Labels**: Tüm etkileşimli elementlerde açıklayıcı etiketler
- **Live Regions**: Dinamik içerik değişiklikleri için screen reader duyuruları
- **Focus Management**: Görünür focus göstergeleri
- **Semantic HTML**: Uygun landmark elementleri (main, nav, vb.)
- **Color Contrast**: WCAG AA standartlarına uygun renk kontrastı
- **Reduced Motion**: Hareket hassasiyeti olan kullanıcılar için destek

