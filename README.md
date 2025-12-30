# 8D Problem Çözme Platformu (MVP)

## 📋 Proje Özeti

Bu proje, üretim hatlarında yaşanan problemleri takip etmek ve kök nedenlerini analiz etmek amacıyla "8D Problem Çözme Metodolojisi"ni dijitalleştirmektedir. Proje, "Problem Tanımlama (D1-D2)" ve "Kök Neden Analizi (D4-D5)" süreçlerini simüle eden bir Full Stack prototip (MVP) olarak geliştirilmiştir.

Çalışma, Siemens iX tasarım sistemine uyum sağlamakta ve PHP ile ilişkisel veri yapılarını (Recursive/Tree Data) modellemektedir.

---

## 🚀 Hızlı Başlangıç (Yerel Kurulum)

### Ön Gereksinimler

Projeyi çalıştırmadan önce aşağıdaki yazılımların yüklü olduğundan emin olun:

| Yazılım | Minimum Versiyon | İndirme Linki |
|---------|------------------|---------------|
| **Node.js** | 18.x veya üstü | [nodejs.org](https://nodejs.org/) |
| **XAMPP** | 8.2.x (PHP 8.2+) | [apachefriends.org](https://www.apachefriends.org/) |
| **Git** | 2.x | [git-scm.com](https://git-scm.com/) |

> 💡 **Not:** XAMPP, Apache web sunucusu, MySQL veritabanı ve PHP'yi tek pakette içerir.

---

### 📥 Adım 1: Projeyi Klonlayın

1. **Terminali açın** (Windows'ta PowerShell veya Git Bash)

2. **XAMPP htdocs dizinine gidin:**
   ```bash
   cd C:\xampp\htdocs
   ```

3. **Projeyi GitHub'dan klonlayın:**
   ```bash
   git clone https://github.com/KULLANICI_ADI/8d-projects.git
   ```
   > ⚠️ `KULLANICI_ADI` kısmını kendi GitHub kullanıcı adınızla değiştirin.

4. **Proje dizinine girin:**
   ```bash
   cd 8d-projects
   ```

---

### 🗄️ Adım 2: Veritabanı Kurulumu

1. **XAMPP'ı başlatın:**
   - XAMPP Control Panel'i açın
   - **Apache** ve **MySQL** servislerini "Start" butonuna tıklayarak başlatın

2. **phpMyAdmin'e erişin:**
   - Tarayıcınızda şu adrese gidin: [http://localhost/phpmyadmin](http://localhost/phpmyadmin)

3. **Veritabanı oluşturun:**

   **Yöntem A - SQL Dosyasını İçe Aktarma (Önerilen):**
   - phpMyAdmin'de "İçe Aktar" (Import) sekmesine tıklayın
   - `backend/database/schema.sql` dosyasını seçin
   - "Git" (Go) butonuna tıklayın

   **Yöntem B - Manuel SQL Çalıştırma:**
   - phpMyAdmin'de "SQL" sekmesine tıklayın
   - Aşağıdaki SQL komutlarını yapıştırıp çalıştırın:

   ```sql
   -- Veritabanı oluştur
   CREATE DATABASE IF NOT EXISTS `8d_problem_solving` 
   CHARACTER SET utf8mb4 
   COLLATE utf8mb4_unicode_ci;

   USE `8d_problem_solving`;

   -- Problems tablosu
   CREATE TABLE IF NOT EXISTS `problems` (
       `id` INT AUTO_INCREMENT PRIMARY KEY,
       `title` VARCHAR(255) NOT NULL,
       `description` TEXT,
       `responsible` VARCHAR(100),
       `team` VARCHAR(100),
       `deadline` DATE,
       `status` ENUM('open', 'in_progress', 'd4_completed', 'd5_completed', 'closed') DEFAULT 'open',
       `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

   -- Root Causes tablosu (5 Neden Analizi)
   CREATE TABLE IF NOT EXISTS `root_causes` (
       `id` INT AUTO_INCREMENT PRIMARY KEY,
       `problem_id` INT NOT NULL,
       `parent_id` INT DEFAULT NULL,
       `description` TEXT NOT NULL,
       `is_root_cause` TINYINT(1) DEFAULT 0,
       `action_plan` TEXT,
       `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON DELETE CASCADE,
       FOREIGN KEY (`parent_id`) REFERENCES `root_causes`(`id`) ON DELETE CASCADE
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

   -- Performans için indexler
   CREATE INDEX idx_problems_status ON problems(status);
   CREATE INDEX idx_root_causes_problem ON root_causes(problem_id);
   CREATE INDEX idx_root_causes_parent ON root_causes(parent_id);
   ```

4. **Veritabanı bağlantısını doğrulayın:**
   - `8d_problem_solving` veritabanının oluştuğunu kontrol edin
   - `problems` ve `root_causes` tablolarının listelendiğini görün

---

### ⚙️ Adım 3: Backend Yapılandırması

1. **Veritabanı ayarlarını kontrol edin:**

   `backend/config/database.php` dosyası varsayılan olarak şu ayarları kullanır:
   
   | Ayar | Varsayılan Değer |
   |------|------------------|
   | Host | `localhost` |
   | Port | `3306` |
   | Veritabanı | `8d_problem_solving` |
   | Kullanıcı | `root` |
   | Şifre | (boş) |

   > 💡 XAMPP varsayılan kurulumunda bu ayarlar otomatik olarak çalışır.

2. **MySQL şifreniz varsa:**
   
   Eğer MySQL root kullanıcısına şifre belirlediyseniz, ortam değişkeni ayarlayabilirsiniz:
   ```bash
   # Windows PowerShell
   $env:DB_PASSWORD="sizin_sifreniz"
   ```

---

### 🎨 Adım 4: Frontend Kurulumu

1. **Frontend dizinine gidin:**
   ```bash
   cd frontend
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```
   > Bu işlem ilk seferde birkaç dakika sürebilir.

3. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

4. **Uygulamayı açın:**
   
   Terminal çıktısında gösterilen adresi tarayıcınızda açın (genellikle):
   ```
   http://localhost:5173
   ```

---

### ✅ Kurulum Tamamlandı!

Şimdi aşağıdaki adresleri kullanabilirsiniz:

| Servis | URL |
|--------|-----|
| **Frontend (React)** | http://localhost:5173 |
| **Backend API** | http://localhost/8d-projects/backend/api/ |
| **phpMyAdmin** | http://localhost/phpmyadmin |

---

## 🛠️ Teknoloji Yığını (Tech Stack)

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

---

## 📂 Proje Dizin Yapısı

```
8d-projects/
├── backend/
│   ├── api/
│   │   ├── problems.php          # Problem CRUD API
│   │   └── root_causes.php       # Kök neden API
│   ├── config/
│   │   └── database.php          # Veritabanı bağlantısı
│   └── database/
│       └── schema.sql            # Veritabanı şeması
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── siemens-ag-logo.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/        # Ana sayfa bileşeni
│   │   │   ├── ProblemDetail/    # Problem detay bileşeni
│   │   │   ├── ProblemModal/     # Yeni problem modal
│   │   │   ├── RootCauseTree/    # Kök neden ağacı
│   │   │   └── TreeNode/         # Ağaç düğüm bileşeni
│   │   ├── services/             # API servis katmanı
│   │   ├── hooks/                # Custom React hooks
│   │   ├── utils/                # Yardımcı fonksiyonlar
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🔌 API Endpoint'leri

### Problems API (`/api/problems.php`)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/problems.php` | Tüm problemleri listeler |
| `GET` | `/api/problems.php?id={id}` | Belirli bir problemi getirir |
| `POST` | `/api/problems.php` | Yeni problem oluşturur |
| `PUT` | `/api/problems.php?id={id}` | Problemi günceller |
| `DELETE` | `/api/problems.php?id={id}` | Problemi siler |

### Root Causes API (`/api/root_causes.php`)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/root_causes.php?problem_id={id}` | Kök neden ağacını getirir |
| `POST` | `/api/root_causes.php` | Yeni kök neden ekler |
| `PUT` | `/api/root_causes.php` | Kök nedeni günceller |
| `DELETE` | `/api/root_causes.php?id={id}` | Kök nedeni siler |

---

## ✨ Özellikler

### Dashboard (Problem Listesi)
- AG-Grid ile problem listesi (ID, Başlık, Sorumlu, Ekip, Durum, Termin, Tarih)
- Siemens IX AG-Grid teması
- Türkçe tarih formatı (GG.AA.YYYY)
- Responsive tasarım
- Yeni Problem Ekle modal penceresi

### Kök Neden Analizi (5 Neden - Why-Why)
- Hiyerarşik ağaç görselleştirmesi
- Sınırsız derinlikte alt neden ekleme
- Kök neden işaretleme
- Kalıcı Çözüm Aksiyonu (D6) tanımlama
- Otomatik durum güncelleme

### Tema Desteği
- Aydınlık ve karanlık tema geçişi
- Sistem tercihini algılama
- LocalStorage'da tema saklama

### Erişilebilirlik (WCAG AA)
- ARIA etiketleri ve roller
- Klavye navigasyonu
- Screen reader desteği
- Yüksek kontrast modu

---

## 🎨 Siemens iX Bileşenleri

| Bileşen | Kullanım Alanı |
|---------|----------------|
| `IxApplication` | Ana uygulama çerçevesi |
| `IxApplicationHeader` | Başlık ve tema değiştirici |
| `IxButton`, `IxIconButton` | Butonlar |
| `IxModal` | Modal pencereleri |
| `IxInput`, `IxTextarea` | Form elemanları |
| `IxCheckbox` | Onay kutuları |
| `IxTooltip` | İpucu metinleri |
| `IxTabs` | Sekme navigasyonu |

---

## ❓ Sık Karşılaşılan Sorunlar

### "CORS hatası" alıyorum
- Apache servisinin çalıştığından emin olun
- Backend API'nin `http://localhost/8d-projects/backend/api/` adresinde erişilebilir olduğunu kontrol edin

### "Veritabanı bağlantı hatası" alıyorum
- MySQL servisinin XAMPP'ta çalıştığından emin olun
- `8d_problem_solving` veritabanının oluşturulduğunu kontrol edin
- phpMyAdmin'de tabloların varlığını doğrulayın

### "npm install" hatası
- Node.js versiyonunuzu kontrol edin: `node --version` (18.x olmalı)
- `node_modules` klasörünü silip tekrar deneyin:
  ```bash
  rmdir /s /q node_modules
  npm install
  ```

### Port 5173 kullanımda
- Vite farklı bir port seçecektir, terminal çıktısını kontrol edin
- Veya önceki geliştirme sunucusunu kapatın

---

## 📝 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
