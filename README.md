# 8D Problem Çözme Platformu

## 1. Proje Özeti

Bu proje, üretim hatlarında yaşanan problemleri takip etmek ve kök nedenlerini analiz etmek amacıyla **8D Problem Çözme Metodolojisi**ni dijitalleştirmektedir. Proje, "Problem Tanımlama (D1-D2)" ve "Kök Neden Analizi (D4-D5)" süreçlerini simüle eden bir Full Stack prototip (MVP) olarak geliştirilmiştir.

Çalışma, **Siemens iX Design System** tasarım sistemine uyum sağlamakta ve PHP ile ilişkisel veri yapılarını (Recursive/Tree Data) modellemektedir.

---

## 2. Teknoloji Yığını

### Frontend
| Teknoloji | Açıklama |
|-----------|----------|
| React 18 | UI Framework |
| Siemens iX React | UI Komponent Kütüphanesi |
| AG-Grid Community | Tablo Bileşeni |
| Vite | Build Aracı |
| React Router DOM | Yönlendirme |

### Backend
| Teknoloji | Açıklama |
|-----------|----------|
| PHP 8.x | Sunucu Tarafı Dil |
| RESTful API | JSON tabanlı API |
| PDO | Veritabanı Erişimi |

### Veritabanı
| Teknoloji | Açıklama |
|-----------|----------|
| MySQL 5.7+ | İlişkisel Veritabanı |
| InnoDB | Depolama Motoru |

---

## 3. Yerel Geliştirme Ortamı Kurulumu

### 3.1 Ön Gereksinimler

Aşağıdaki yazılımların sisteminizde kurulu olması gerekmektedir:

| Yazılım | Minimum Versiyon | İndirme Adresi |
|---------|------------------|----------------|
| Node.js | 18.x | https://nodejs.org/ |
| XAMPP | 8.2.x (PHP 8.2+) | https://www.apachefriends.org/ |
| Git | 2.x | https://git-scm.com/ |

### 3.2 Projeyi Klonlama

1. Terminal veya PowerShell açın.

2. XAMPP htdocs dizinine gidin:
   ```bash
   cd C:\xampp\htdocs
   ```

3. Projeyi klonlayın:
   ```bash
   git clone https://github.com/KULLANICI_ADI/8d-projects.git
   ```

4. Proje dizinine girin:
   ```bash
   cd 8d-projects
   ```

### 3.3 Veritabanı Kurulumu

1. XAMPP Control Panel üzerinden **Apache** ve **MySQL** servislerini başlatın.

2. Tarayıcıda phpMyAdmin arayüzüne erişin:
   ```
   http://localhost/phpmyadmin
   ```

3. Veritabanı şemasını içe aktarın:

   **Yöntem A - SQL Dosyası İçe Aktarma (Önerilen):**
   - phpMyAdmin'de "Import" sekmesine tıklayın
   - `backend/database/schema.sql` dosyasını seçin
   - "Go" butonuna tıklayın

   **Yöntem B - Manuel SQL Çalıştırma:**
   - phpMyAdmin'de "SQL" sekmesine tıklayın
   - Aşağıdaki komutları çalıştırın:

   ```sql
   CREATE DATABASE IF NOT EXISTS `8d_problem_solving` 
   CHARACTER SET utf8mb4 
   COLLATE utf8mb4_unicode_ci;

   USE `8d_problem_solving`;

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

   CREATE INDEX idx_problems_status ON problems(status);
   CREATE INDEX idx_root_causes_problem ON root_causes(problem_id);
   CREATE INDEX idx_root_causes_parent ON root_causes(parent_id);
   ```

4. Kurulumu doğrulayın:
   - `8d_problem_solving` veritabanının oluştuğunu kontrol edin
   - `problems` ve `root_causes` tablolarının varlığını doğrulayın

### 3.4 Backend Yapılandırması

`backend/config/database.php` dosyası aşağıdaki varsayılan değerleri kullanır:

| Parametre | Varsayılan Değer |
|-----------|------------------|
| DB_HOST | localhost |
| DB_PORT | 3306 |
| DB_NAME | 8d_problem_solving |
| DB_USER | root |
| DB_PASSWORD | (boş) |

XAMPP varsayılan kurulumunda ek yapılandırma gerekmez. Farklı bir MySQL şifresi kullanıyorsanız ortam değişkenlerini ayarlayın.

### 3.5 Frontend Kurulumu

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

4. Uygulamaya erişin:
   ```
   http://localhost:5173
   ```

### 3.6 Erişim Adresleri

| Servis | URL |
|--------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost/8d-projects/backend/api/ |
| phpMyAdmin | http://localhost/phpmyadmin |

---

## 4. Proje Dizin Yapısı

```
8d-projects/
├── backend/
│   ├── api/
│   │   ├── problems.php
│   │   └── root_causes.php
│   ├── config/
│   │   └── database.php
│   └── database/
│       └── schema.sql
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── siemens-ag-logo.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   ├── ProblemDetail/
│   │   │   ├── ProblemModal/
│   │   │   ├── RootCauseTree/
│   │   │   └── TreeNode/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 5. API Dokümantasyonu

### 5.1 Problems API

**Endpoint:** `/api/problems.php`

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/problems.php` | Tüm problemleri listeler |
| GET | `/api/problems.php?id={id}` | Belirli bir problemi getirir |
| POST | `/api/problems.php` | Yeni problem oluşturur |
| PUT | `/api/problems.php?id={id}` | Problemi günceller |
| DELETE | `/api/problems.php?id={id}` | Problemi siler |

### 5.2 Root Causes API

**Endpoint:** `/api/root_causes.php`

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/root_causes.php?problem_id={id}` | Kök neden ağacını getirir |
| POST | `/api/root_causes.php` | Yeni kök neden ekler |
| PUT | `/api/root_causes.php` | Kök nedeni günceller |
| DELETE | `/api/root_causes.php?id={id}` | Kök nedeni siler |

---

## 6. Uygulama Özellikleri

### 6.1 Dashboard
- AG-Grid tabanlı problem listesi
- Siemens IX tema entegrasyonu
- Responsive tasarım
- Problem ekleme modal penceresi

### 6.2 Kök Neden Analizi (5 Neden)
- Hiyerarşik ağaç görselleştirmesi (Recursive Tree)
- Sınırsız derinlikte alt neden ekleme
- Kök neden işaretleme
- Kalıcı Çözüm Aksiyonu (D6) tanımlama

### 6.3 Tema Desteği
- Aydınlık/Karanlık tema geçişi
- Sistem tercihini algılama
- LocalStorage ile kalıcılık

### 6.4 Erişilebilirlik (WCAG AA)
- ARIA etiketleri ve roller
- Klavye navigasyonu
- Screen reader desteği

---

## 7. Siemens iX Bileşenleri

| Bileşen | Kullanım Alanı |
|---------|----------------|
| IxApplication | Ana uygulama çerçevesi |
| IxApplicationHeader | Başlık ve tema değiştirici |
| IxButton, IxIconButton | Butonlar |
| IxModal | Modal pencereleri |
| IxInput, IxTextarea | Form elemanları |
| IxCheckbox | Onay kutuları |
| IxTooltip | İpucu metinleri |
| IxTabs | Sekme navigasyonu |
| IxPill | Durum göstergeleri |

---

## 8. Sorun Giderme

### Veritabanı Bağlantı Hatası
- XAMPP'ta MySQL servisinin çalıştığını doğrulayın
- `8d_problem_solving` veritabanının oluşturulduğunu kontrol edin

### CORS Hatası
- Apache servisinin çalıştığından emin olun
- Backend API erişilebilirliğini test edin

### npm install Hatası
- Node.js versiyonunu kontrol edin: `node --version`
- `node_modules` klasörünü silip yeniden kurun

---

## 9. Lisans

Bu proje, Siemens Teknik Değerlendirme kapsamında geliştirilmiştir.
