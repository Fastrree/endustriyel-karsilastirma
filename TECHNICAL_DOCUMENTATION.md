# Endüstriyel Karşılaştırma — Teknik Dökümantasyon

**Versiyon**: 0.0.0  
**Son Güncelleme**: Mart 2026  
**Durum**: Aktif Geliştirme

---

## İçindekiler

1. [Proje Genel Bakış](#1-proje-genel-bakış)
2. [Teknoloji Yığını](#2-teknoloji-yığını)
3. [Proje Yapısı](#3-proje-yapısı)
4. [Mimari](#4-mimari)
5. [Veri Modeli & Tip Sistemi](#5-veri-modeli--tip-sistemi)
6. [State Yönetimi (Zustand)](#6-state-yönetimi-zustand)
7. [Servisler](#7-servisler)
8. [Scraper Sistemi](#8-scraper-sistemi)
9. [Veritabanı Katmanı](#9-veritabanı-katmanı)
10. [Bileşen Mimarisi](#10-bileşen-mimarisi)
11. [Sayfalar](#11-sayfalar)
12. [Export Sistemi](#12-export-sistemi)
13. [Electron Entegrasyonu](#13-electron-entegrasyonu)
14. [Capacitor / Android](#14-capacitor--android)
15. [Build & Deployment](#15-build--deployment)
16. [Güvenlik](#16-güvenlik)
17. [Performans](#17-performans)
18. [Bilinen Eksikler & Yol Haritası](#18-bilinen-eksikler--yol-haritası)

---

## 1. Proje Genel Bakış

Endüstriyel Karşılaştırma, tekstil sektörüne yönelik geliştirilmiş çok platformlu bir ürün karşılaştırma uygulamasıdır. Tedarikçi web sitelerinden otomatik veri toplama (web scraping), ürün karşılaştırma, filtreleme ve çoklu formatlarda dışa aktarma işlevlerini tek bir arayüzde sunar.

### Hedef Kullanıcılar

- Tekstil sektöründe satın alma yöneticileri
- Tedarik zinciri uzmanları
- Fiyat analizi yapan mühendisler

### Temel Özellikler

- Puppeteer tabanlı otomatik web scraping (Kumaşçı, Kumaş Fırsatı, Tekstil Türkiye)
- Gerçek zamanlı ürün filtreleme ve sıralama
- Yan yana ürün karşılaştırma (maks. 4 ürün)
- Excel (çok sayfalı, temalı), CSV ve PDF dışa aktarma
- 24 saatlik önbellek sistemi
- Electron ile masaüstü uygulama (Windows portable)
- Capacitor ile Android mobil uygulama
- SQLite (Electron) ve localStorage (tarayıcı) çift mod veritabanı

---

## 2. Teknoloji Yığını

| Katman | Teknoloji | Versiyon | Amaç |
|--------|-----------|----------|------|
| UI Framework | React | 19.2.0 | Bileşen tabanlı UI |
| Dil | TypeScript | ~5.9.3 | Tip güvenliği |
| Build Aracı | Vite | 7.3.1 | Hızlı bundling, HMR |
| State Yönetimi | Zustand | 5.0.11 | Hafif store, persist desteği |
| Routing | React Router DOM | 7.13.1 | Client-side routing |
| İkonlar | Lucide React | 0.576.0 | SVG ikon kütüphanesi |
| Grafikler | Recharts | 3.7.0 | Veri görselleştirme (kurulu, henüz aktif değil) |
| Excel Export | ExcelJS | 4.4.0 | Zengin Excel üretimi |
| Spreadsheet | XLSX | 0.18.5 | Ek spreadsheet yardımcıları |
| Web Scraping | Puppeteer | 24.37.5 | Headless Chromium otomasyonu |
| HTML Parse | Cheerio | 1.2.0 | jQuery benzeri DOM ayrıştırma |
| Veritabanı | better-sqlite3 | 12.6.2 | Senkron SQLite (Electron) |
| HTTP İstemci | Axios | 1.13.6 | API istekleri |
| Masaüstü | Electron | 40.6.1 | Cross-platform desktop |
| Mobil | Capacitor | 8.1.0 | iOS/Android köprüsü |
| Linting | ESLint | 9.39.1 | Kod kalitesi |
| Stil | CSS Modules | — | Scoped bileşen stilleri |

---

## 3. Proje Yapısı

```
endustriyel-karsilastirma/
├── electron/
│   ├── main.cjs              # Electron ana süreç
│   └── preload.cjs           # Güvenli IPC köprüsü
├── android/                  # Capacitor Android projesi
├── public/
│   └── icon.ico              # Uygulama ikonu
├── src/
│   ├── main.tsx              # React giriş noktası
│   ├── App.tsx               # Kök bileşen, routing
│   ├── App.module.css
│   ├── index.css
│   │
│   ├── components/
│   │   ├── features/
│   │   │   ├── ProductDetailModal.tsx   # Ürün detay modalı
│   │   │   ├── ScraperPanel.tsx         # Scraper yönetim paneli
│   │   │   └── ScraperTestPanel.tsx     # Scraper test arayüzü
│   │   ├── layout/
│   │   │   ├── Header.tsx               # Üst navigasyon
│   │   │   ├── Sidebar.tsx              # Filtre yan paneli
│   │   │   └── BottomNav.tsx            # Alt navigasyon (mobil)
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Toast.tsx                # Bildirim sistemi
│   │       ├── SkeletonLoader.tsx       # Yükleme iskelet ekranı
│   │       └── CacheStatus.tsx         # Önbellek yaşı göstergesi
│   │
│   ├── pages/
│   │   ├── Home/Home.tsx               # Dashboard
│   │   ├── Products/Products.tsx       # Ürün listesi
│   │   ├── Compare/Compare.tsx         # Karşılaştırma
│   │   └── Scrapers/Scrapers.tsx       # Scraper yönetimi
│   │
│   ├── services/
│   │   ├── scraperService.ts           # Puppeteer scraping motoru
│   │   ├── scraperManager.ts           # Scraper orkestrasyon
│   │   ├── exportService.ts            # Excel/CSV/PDF export
│   │   ├── databaseService.ts          # DB soyutlama katmanı
│   │   ├── cacheService.ts             # Önbellek yönetimi
│   │   └── mockDataService.ts          # Geliştirme mock verisi
│   │
│   ├── store/
│   │   └── index.ts                    # 6 Zustand store (monolith)
│   │
│   ├── scrapers/
│   │   ├── BaseScraper.ts              # Soyut temel sınıf
│   │   ├── scraperConfigs.ts           # Scraper konfigürasyonları
│   │   ├── scraperLoader.ts            # Dinamik scraper yükleme
│   │   ├── index.ts
│   │   └── sites/
│   │       ├── KumasciScraper.ts
│   │       ├── KumasFirsatiScraper.ts
│   │       └── TekstilTurkiyeScraper.ts
│   │
│   ├── db/
│   │   ├── database.ts                 # DB başlatma
│   │   ├── migrations.ts               # Şema migrasyonları
│   │   ├── schema.sql                  # SQLite şeması
│   │   └── repositories/
│   │       ├── ProductRepository.ts
│   │       ├── SupplierRepository.ts
│   │       └── ScraperRepository.ts
│   │
│   ├── hooks/
│   │   └── useDatabase.ts              # DB React hook
│   │
│   ├── types/
│   │   ├── index.ts                    # Tüm tip tanımları
│   │   └── electron.d.ts               # Electron API tipleri
│   │
│   ├── styles/
│   │   ├── globals.css                 # Global stiller
│   │   └── animations.css             # Animasyon tanımları
│   │
│   └── utils/                          # (Boş — gelecek yardımcılar)
│
├── capacitor.config.ts
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── package.json
├── vercel.json
└── ROADMAP.md
```

---

## 4. Mimari

### Genel Mimari Diyagramı

```
┌─────────────────────────────────────────────────────────────┐
│                        KULLANICI ARAYÜZÜ                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Home    │  │ Products │  │ Compare  │  │ Scrapers │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       └──────────────┴──────────────┴──────────────┘        │
│                           │                                  │
│              ┌────────────▼────────────┐                    │
│              │     Zustand Stores      │                    │
│              │  Product | Filter |     │                    │
│              │  Compare | Settings |   │                    │
│              │  Scraping | Notify      │                    │
│              └────────────┬────────────┘                    │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                       SERVİS KATMANI                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ ScraperSvc   │  │ ExportSvc    │  │ DatabaseSvc  │      │
│  │ (Puppeteer)  │  │ (Excel/PDF)  │  │ (Dual Mode)  │      │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘      │
│         │                                    │              │
│  ┌──────▼───────┐                   ┌────────▼──────┐      │
│  │ CacheSvc     │                   │ Electron IPC  │      │
│  │ (localStorage│                   │ OR localStorage│      │
│  └──────────────┘                   └────────┬───────┘      │
└────────────────────────────────────────────── ┼─────────────┘
                                                │
                    ┌───────────────────────────▼──────────┐
                    │           VERİ KATMANI                │
                    │  ┌─────────────┐  ┌───────────────┐  │
                    │  │  SQLite DB  │  │  localStorage  │  │
                    │  │  (Electron) │  │  (Browser/PWA) │  │
                    │  └─────────────┘  └───────────────┘  │
                    └──────────────────────────────────────┘
```

### Çalışma Modları

| Mod | Platform | Veritabanı | Scraping |
|-----|----------|------------|----------|
| **Electron Desktop** | Windows | SQLite (better-sqlite3) | Puppeteer (tam) |
| **Web Browser** | Chrome/Firefox/Edge | localStorage | Kısıtlı (CORS) |
| **Android (Capacitor)** | Android | localStorage | Kısıtlı |

### Routing Yapısı

```
/           → Home (Dashboard)
/products   → Products (Ürün listesi)
/compare    → Compare (Karşılaştırma)
/scrapers   → Scrapers (Scraper yönetimi)
/test       → ScraperTestPanel (Geliştirme)
*           → 404 Not Found
```

---

## 5. Veri Modeli & Tip Sistemi

### Product

```typescript
interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;           // 'tekstil', 'iplik', vb.
  subcategory?: string;
  sku?: string;
  brand?: string;
  supplier: Supplier;
  price: number;
  currency: string;           // 'TRY', 'USD', 'EUR', 'GBP'
  unit: string;               // 'kg', 'metre', 'adet', vb.
  minOrderQuantity?: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  specifications: ProductSpecification[];
  images?: string[];
  url?: string;
  lastUpdated: Date;
  isFavorite?: boolean;
  scrapedAt: Date;
  source: string;             // Scraper ID
  isCached?: boolean;
}

interface ProductSpecification {
  key: string;
  value: string;
  unit?: string;
}
```

### Supplier

```typescript
interface Supplier {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  rating?: number;            // 0-5
  reliability?: number;       // 0-100
  lastScraped?: Date;
}
```

### FilterState

```typescript
interface FilterState {
  searchQuery: string;
  categories: string[];
  suppliers: string[];
  priceRange: { min: number | null; max: number | null };
  stockStatus: ('in_stock' | 'low_stock' | 'out_of_stock')[];
  sortBy: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'date_desc';
}
```

### ScraperConfig

```typescript
interface ScraperConfig {
  id: string;
  supplierId: string;
  url: string;
  name: string;
  baseUrl: string;
  category: string;
  selectors: {
    productList: string;      // CSS selector — ürün listesi
    productName: string;      // CSS selector — ürün adı
    productPrice: string;     // CSS selector — fiyat
    productDescription?: string;
    nextPage?: string;        // CSS selector — sonraki sayfa
  };
  schedule: 'manual' | 'hourly' | 'daily' | 'weekly';
  isActive: boolean;
  lastRun?: Date;
  lastStatus?: 'success' | 'error' | 'running';
}
```

### AppSettings

```typescript
interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  language: 'tr' | 'en';
  notifications: boolean;
  autoUpdate: boolean;
  defaultCurrency: string;
}
```

---

## 6. State Yönetimi (Zustand)

Tüm store'lar `src/store/index.ts` içinde tanımlıdır. Zustand'ın `persist` middleware'i ile seçili store'lar localStorage'a yazılır.

### useProductStore

Ürün verilerini ve CRUD operasyonlarını yönetir.

```typescript
// State
products: Product[]
filteredProducts: Product[]
selectedProduct: Product | null
isLoading: boolean
error: string | null

// Actions
setProducts(products)
addProduct(product)
updateProduct(id, updates)
deleteProduct(id)
setSelectedProduct(product)
setLoading(isLoading)
setError(error)
toggleFavorite(id)

// Getters
getProductById(id)
getProductsBySupplier(supplierId)
getProductsByCategory(category)
getFavoriteProducts()
```

### useFilterStore

Filtre durumunu ve `applyFilters()` mantığını barındırır.

```typescript
// State
filters: FilterState

// Actions
setSearchQuery(query)
setCategories(categories)
toggleCategory(category)
setSuppliers(suppliers)
toggleSupplier(supplier)
setPriceRange(min, max)
setStockStatus(status[])
setSortBy(sortBy)
resetFilters()

// Core Method
applyFilters(products: Product[]): Product[]
// — searchQuery: name + description + category + supplier.name
// — categories: çoklu seçim
// — suppliers: çoklu seçim
// — priceRange: min/max
// — stockStatus: çoklu seçim
// — sortBy: price_asc | price_desc | name_asc | name_desc | date_desc
```

### useComparisonStore (Persisted)

Karşılaştırma listesini yönetir. Maksimum 4 ürün.

```typescript
// State
comparison: { items: ComparisonItem[], maxItems: 4 }

// Actions
addToComparison(product)
removeFromComparison(productId)
clearComparison()

// Getters
isInComparison(productId): boolean
canAddMore(): boolean
```

### useSettingsStore (Persisted)

Uygulama ayarlarını yönetir.

```typescript
// State
settings: AppSettings

// Actions
setTheme(theme)
setLanguage(language)
toggleNotifications()
updateSettings(partial)
```

### useNotificationStore

Toast bildirimlerini yönetir. Maksimum 50 bildirim.

```typescript
// State
notifications: Notification[]

// Actions
addNotification({ type, title, message })
removeNotification(id)
markAsRead(id)
clearAll()

// Getters
getUnreadCount(): number
```

### useScrapingStore (Persisted)

Scraping sürecinin durumunu takip eder.

```typescript
// State
isScraping: boolean
scrapingProgress: number        // 0-100
scrapingMessage: string
lastScrapeTime: Date | null
scrapeError: string | null

// Actions
startScraping()
updateProgress(progress, message)
finishScraping(products)
loadFromCache(products)
forceRefresh()
```

---

## 7. Servisler

### scraperService.ts — Web Scraping Motoru

`ScraperService` sınıfı Puppeteer tabanlı scraping altyapısını sağlar.

**Sabitler:**
```
DEFAULT_RETRY_ATTEMPTS    = 3
DEFAULT_RETRY_DELAY       = 2000ms
DEFAULT_RATE_LIMIT_DELAY  = 1000ms
DEFAULT_TIMEOUT           = 30000ms
DEFAULT_CACHE_DURATION    = 24 saat
```

**Temel Metodlar:**

| Metod | Açıklama |
|-------|----------|
| `initialize()` | Puppeteer browser başlatır (sandbox devre dışı) |
| `scrapeUrl(url, config)` | Tek URL scraping, retry ile |
| `scrapeWithFallback(config)` | Önce cache kontrol, başarısızsa scrape |
| `scrapeMultiple(configs[])` | Toplu scraping, rate limiting ile |
| `validateCache(url)` | Cache geçerliliği kontrol (24h) |
| `getStats()` | Scraper istatistikleri |
| `close()` | Browser kapat |

**Fiyat Ayrıştırma:**
- TRY (`₺`), USD (`$`), EUR (`€`), GBP (`£`) para birimi tespiti
- Avrupa formatı: `1.234,56` → `1234.56`
- ABD formatı: `1,234.56` → `1234.56`

**Hata Sınıfları:**
```typescript
class ScraperError extends Error {
  code: string    // 'TIMEOUT', 'NETWORK_ERROR', vb.
  url?: string
  originalError?: Error
}

class RetryExhaustedError extends ScraperError {
  // code: 'RETRY_EXHAUSTED'
  // Tüm retry denemeleri tükendi
}
```

### scraperManager.ts — Scraper Orkestrasyon

Birden fazla scraper'ı koordine eder, sıralı veya paralel çalıştırır.

### cacheService.ts — Önbellek Yönetimi

localStorage tabanlı önbellek. Scraping başarısız olduğunda son geçerli veriyi döner.

```typescript
// Cache anahtarı: scraper ID
// Cache süresi: 24 saat (DEFAULT_CACHE_DURATION)
// Durum: 'fresh' | 'stale' | 'error'
```

### mockDataService.ts — Geliştirme Verisi

`getMockProducts()` — Gerçek veri yokken kullanılan örnek ürün seti. Tüm sayfalar bu servise fallback yapar.

### databaseService.ts — Veritabanı Soyutlama

Electron (SQLite) ve tarayıcı (localStorage) için tek API sunar.

```typescript
// Ortam tespiti
const isElectron = (): boolean =>
  typeof window !== 'undefined' && !!window.electronAPI;

// Electron modunda: IPC üzerinden SQLite
// Browser modunda: localStorage JSON

// Temel fonksiyonlar
getAllProducts(filters?)
getProductById(id)
createProduct(product)
updateProduct(id, updates)
deleteProduct(id)
searchProducts(query)
getAllSuppliers()
getAllScrapers()
getDatabaseStats()
runScraper(id)
runAllScrapers()
stopScraper(id)
```

**localStorage Anahtarları:**
```
db_products
db_suppliers
db_scrapers
db_scraper_logs
```

---

## 8. Scraper Sistemi

### BaseScraper (Soyut Sınıf)

Tüm site-spesifik scraper'ların türediği temel sınıf.

```typescript
abstract class BaseScraper {
  protected config: ScraperConfig
  protected options: ScraperOptions
  protected name: string

  constructor(config, options = {
    headless: true,
    delay: 1000,
    timeout: 30000,
    maxRetries: 3
  })

  abstract scrape(): Promise<ScrapingResult>

  protected delay(ms): Promise<void>
  protected generateId(name): string
  protected parsePrice(priceText): { price: number; currency: string }
}
```

### Site-Spesifik Scraper'lar

| Scraper | Dosya | Hedef Site |
|---------|-------|------------|
| KumasciScraper | `sites/KumasciScraper.ts` | Kumaşçı platformu |
| KumasFirsatiScraper | `sites/KumasFirsatiScraper.ts` | Kumaş Fırsatı platformu |
| TekstilTurkiyeScraper | `sites/TekstilTurkiyeScraper.ts` | Tekstil Türkiye platformu |

Her scraper `BaseScraper`'ı extend eder ve `scrape()` metodunu implement eder.

### scraperLoader.ts — Dinamik Yükleme

Scraper ID'sine göre doğru scraper sınıfını dinamik olarak yükler. Bu sayede yeni scraper eklemek için sadece `sites/` klasörüne yeni dosya eklemek yeterlidir.

### scraperConfigs.ts — Konfigürasyonlar

Tüm aktif scraper konfigürasyonlarını içerir. Her konfigürasyon `ScraperConfig` tipine uyar.

### Scraping Akışı

```
1. ScraperManager.runAll() çağrılır
2. Her ScraperConfig için ScraperLoader.load(id) çağrılır
3. Uygun scraper sınıfı instantiate edilir
4. scraper.scrape() çalışır:
   a. Puppeteer browser açılır
   b. Hedef URL yüklenir
   c. CSS selector'lar ile ürünler çekilir
   d. parsePrice() ile fiyat normalize edilir
   e. Product[] döner
5. Sonuçlar CacheService'e yazılır
6. ProductStore güncellenir
7. ScrapingLog kaydedilir
```

### Scraping Kısıtlamaları

- **CORS**: Tarayıcı modunda cross-origin scraping çalışmaz. Electron gerektirir.
- **Rate Limiting**: İstekler arası minimum 1000ms bekleme
- **Retry**: Başarısız istekler 3 kez tekrar denenir (2000ms backoff)
- **Timeout**: Her sayfa yüklemesi için 30 saniye limit
- **Cache**: Başarılı scraping sonuçları 24 saat önbellekte tutulur

---

## 9. Veritabanı Katmanı

### SQLite Şeması

```sql
-- Tedarikçiler
CREATE TABLE suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    website TEXT,
    logo TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    contact_address TEXT,
    rating REAL,
    reliability REAL,
    last_scraped DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ürünler
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    category TEXT,
    subcategory TEXT,
    sku TEXT,
    brand TEXT,
    supplier_id TEXT,
    price REAL,
    currency TEXT,
    unit TEXT,
    min_order_quantity INTEGER,
    stock_status TEXT CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
    specifications TEXT,    -- JSON string
    images TEXT,            -- JSON string
    url TEXT,
    scraped_at DATETIME,
    source TEXT,
    is_favorite INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- Scraper konfigürasyonları
CREATE TABLE scraper_configs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    supplier_id TEXT,
    base_url TEXT,
    category TEXT,
    selectors TEXT,         -- JSON string
    schedule TEXT CHECK (schedule IN ('manual', 'hourly', 'daily', 'weekly')),
    is_active INTEGER DEFAULT 1,
    last_run DATETIME,
    last_status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- Scraping logları
CREATE TABLE scraping_logs (
    id TEXT PRIMARY KEY,
    scraper_id TEXT,
    status TEXT,
    message TEXT,
    items_scraped INTEGER DEFAULT 0,
    started_at DATETIME,
    completed_at DATETIME,
    error_details TEXT,
    FOREIGN KEY (scraper_id) REFERENCES scraper_configs(id) ON DELETE CASCADE
);

-- Karşılaştırma öğeleri
CREATE TABLE comparison_items (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### İndeksler

```sql
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_supplier_id ON products(supplier_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_scraped_at ON products(scraped_at);
CREATE INDEX idx_scraper_configs_supplier_id ON scraper_configs(supplier_id);
CREATE INDEX idx_scraping_logs_scraper_id ON scraping_logs(scraper_id);
CREATE INDEX idx_comparison_items_product_id ON comparison_items(product_id);
```

### Repository Katmanı

```
src/db/repositories/
├── ProductRepository.ts    — Ürün CRUD + filtreleme
├── SupplierRepository.ts   — Tedarikçi CRUD
├── ScraperRepository.ts    — Scraper config + log yönetimi
└── index.ts                — Barrel export
```

### Migrasyon Sistemi

`src/db/migrations.ts` — Şema versiyonlama ve otomatik migrasyon. Uygulama başlangıcında çalışır.

---

## 10. Bileşen Mimarisi

### Layout Bileşenleri

#### Header (`src/components/layout/Header.tsx`)
- Logo ve marka adı
- Arama çubuğu (şu an placeholder — Phase 1.3)
- Navigasyon linkleri
- Profil menüsü (şu an placeholder — Phase 1.5)

#### BottomNav (`src/components/layout/BottomNav.tsx`)
- Mobil-first floating alt navigasyon
- Sekmeler: Home, Products, Compare, Scrapers
- Aktif sekme vurgusu
- `useLocation()` ile mevcut route tespiti

#### Sidebar (`src/components/layout/Sidebar.tsx`)
- Floating filtre paneli (sağdan açılır)
- Kategori filtreleri
- Tedarikçi filtreleri
- Fiyat aralığı
- Stok durumu (UI eksik — Phase 1.2)
- Sıralama seçenekleri
- Filtreleri sıfırla butonu
- `isOpen` prop ile kontrol edilir

### Feature Bileşenleri

#### ProductDetailModal (`src/components/features/ProductDetailModal.tsx`)
- Ürün detay modalı
- Tüm spesifikasyonlar
- Tedarikçi bilgileri
- Fiyat ve stok durumu
- Dış link butonu
- Karşılaştırmaya ekle butonu

#### ScraperPanel (`src/components/features/ScraperPanel.tsx`)
- Scraper listesi ve durumları
- Manuel çalıştırma kontrolü
- Son çalışma zamanı
- Hata mesajları

#### ScraperTestPanel (`src/components/features/ScraperTestPanel.tsx`)
- Geliştirme amaçlı test arayüzü
- `/test` route'unda erişilebilir
- Scraper çıktısını canlı gösterir

### UI Bileşenleri

| Bileşen | Açıklama |
|---------|----------|
| `Button` | Variant destekli buton (primary, secondary, ghost) |
| `Card` | Border ve padding ile container |
| `Input` | Stil uygulanmış metin girişi |
| `Toast` | Otomatik kapanan bildirim (success/error/warning/info) |
| `SkeletonLoader` | Yükleme sırasında iskelet ekran |
| `CacheStatus` | Önbellek yaşını gösteren gösterge |

### CSS Yaklaşımı

Proje **CSS Modules** kullanır. Her bileşenin yanında `.module.css` dosyası bulunur.

```
Button.tsx
Button.module.css   ← Scoped stiller
```

Global stiller:
- `src/styles/globals.css` — CSS değişkenleri, reset, temel stiller
- `src/styles/animations.css` — Keyframe animasyonları
- `src/index.css` — Vite entry CSS

**Cockpit Tema Renk Paleti (CSS Değişkenleri):**
```css
--dark:        #0C0C12
--dark-bg:     #12121A
--card-bg:     #1A1A24
--accent:      #0066FF
--green:       #00CC66
--amber:       #FFAA00
--red:         #FF4444
--text-primary:#E0E0E0
--border:      #2A2A35
```

---

## 11. Sayfalar

### Home — Dashboard (`src/pages/Home/Home.tsx`)

Bento grid düzeninde cockpit temalı dashboard.

**İstatistik Kartları** (useMemo ile hesaplanır):
- Toplam ürün sayısı
- Benzersiz tedarikçi sayısı
- Aktif karşılaştırma sayısı
- Son güncelleme zamanı (az önce / Xdk / Xs / Xg)

**Hızlı Eylemler:**
- Ürünlere Git → `/products`
- Karşılaştır → `/compare`

**Aktivite Akışı:**
- Son güncellenen ürünlerin zaman çizelgesi
- `lastUpdated` alanına göre sıralanır

**Trend Bölümü:**
- En yüksek fiyatlı ürünler
- `price` alanına göre azalan sıra

**Favoriler Paneli:**
- `isFavorite: true` olan ürünler
- Hızlı erişim kartları

### Products — Ürün Listesi (`src/pages/Products/Products.tsx`)

**Ürün Kartı Özellikleri:**
- Kategori badge
- Favori toggle (yıldız ikonu)
- Ürün adı ve açıklama
- Spesifikasyon chip'leri
- Fiyat (miktar + para birimi + birim)
- Tedarikçi adı
- Stok durumu badge (in_stock/low_stock/out_of_stock)
- Dış link butonu
- Karşılaştırmaya ekle butonu

**Sayfalama:**
- İlk 6 ürün gösterilir (`INITIAL_COUNT = 6`)
- "Daha Fazla Göster" butonu ile tümü açılır

**Dışa Aktarma Dropdown:**
- Excel — Dashboard + Detay + Fiyat Sıralaması + Spesifikasyon
- CSV — Noktalı virgül ayrımlı, UTF-8 BOM
- PDF — Yazdırma dostu HTML

**Durum Yönetimi:**
- Yükleme: SkeletonLoader
- Hata: AlertTriangle ikonu + mesaj
- Boş sonuç: SearchX ikonu + mesaj

### Compare — Karşılaştırma (`src/pages/Compare/Compare.tsx`)

- Yan yana karşılaştırma (maks. 4 ürün)
- Spesifikasyon matrisi (tüm spec'ler hizalanmış)
- En iyi fiyat vurgusu
- Karşılaştırma PDF export

### Scrapers — Scraper Yönetimi (`src/pages/Scrapers/Scrapers.tsx`)

- Yapılandırılmış scraper listesi
- Manuel tetikleme kontrolü
- Zamanlama yönetimi
- Durum izleme (success/error/running)
- Scraping geçmişi ve loglar

---

## 12. Export Sistemi

`src/services/exportService.ts` — `ExportService` statik sınıfı

### Excel Export (ExcelJS)

Cockpit temalı çok sayfalı Excel dosyası üretir.

**Sayfa 1 — Dashboard:**
- Özet istatistikler (toplam ürün, tedarikçi, stok dağılımı)
- Stok durumu analizi
- Fiyat analizi (min/max/ortalama)
- Tedarikçi dağılımı
- Kategori dağılımı

**Sayfa 2 — Ürün Detayı:**
- Tüm ürünlerin tam tablosu
- Tüm alanlar (ID, ad, kategori, tedarikçi, fiyat, birim, stok, URL)

**Sayfa 3 — Fiyat Sıralaması:**
- Fiyata göre azalan sıra
- Fiyat varyansı hesabı

**Sayfa 4 — Spesifikasyon Karşılaştırması:**
- Tüm ürünlerin spesifikasyon matrisi

**Renk Paleti (Excel):**
```
Arka plan:    #0C0C12 (koyu)
Header:       #0D47A1 (mavi)
Accent:       #0066FF
Başarı:       #00CC66
Uyarı:        #FFAA00
Hata:         #FF4444
Metin:        #E0E0E0
```

**Karşılaştırma Modu:**
- `type: 'comparison'` ile çağrıldığında tek sayfalık karşılaştırma raporu üretir

### CSV Export

```
- Kodlama: UTF-8 BOM (Türkçe karakter desteği)
- Ayırıcı: Noktalı virgül (;)
- Dosya adı: Urun_Listesi_YYYY-MM-DD.csv
- Alanlar: ID, Ad, Kategori, Tedarikçi, Fiyat, Para Birimi, Birim, Stok, URL
```

### PDF Export

HTML tabanlı, tarayıcı print API'si ile PDF üretir.

```
- Düzen: Responsive grid
- Renk kodlu bölümler
- Trend ürünler
- Tedarikçi puanları
- Tam ürün tablosu
- Dosya adı: Urun_Raporu_YYYY-MM-DD.pdf
```

---

## 13. Electron Entegrasyonu

### Ana Süreç (`electron/main.cjs`)

```javascript
// Pencere konfigürasyonu
BrowserWindow({
  width: 1400,
  height: 900,
  minWidth: 1024,
  minHeight: 768,
  webPreferences: {
    nodeIntegration: false,      // Güvenlik: kapalı
    contextIsolation: true,      // Güvenlik: açık
    preload: 'electron/preload.cjs'
  }
})
```

**IPC Handler'lar:**

| Kanal | Açıklama |
|-------|----------|
| `scraper:run` | Belirli scraper'ı çalıştır |
| `scraper:runAll` | Tüm scraper'ları çalıştır |
| `db:scraper:getAll` | Tüm scraper konfigürasyonlarını getir |

### Preload Script (`electron/preload.cjs`)

Context isolation ile renderer process'e güvenli API sunar. `window.electronAPI` üzerinden erişilir.

```typescript
// src/types/electron.d.ts
interface ElectronAPI {
  db: {
    products: {
      getAll(filters?): Promise<ApiResponse<Product[]>>
      // ...
    }
    // suppliers, scrapers, logs...
  }
  scraper: {
    run(id): Promise<ApiResponse<ScrapingResult>>
    runAll(): Promise<ApiResponse<ScrapingResult[]>>
    stop(id): Promise<ApiResponse<void>>
  }
}
```

### Build Konfigürasyonu (`package.json`)

```json
{
  "build": {
    "appId": "com.endustriyel.karsilastirma",
    "productName": "Endustriyel Karsilastirma",
    "win": {
      "target": [{ "target": "portable", "arch": ["x64"] }],
      "icon": "public/icon.ico"
    },
    "portable": {
      "artifactName": "Endustriyel_Karsilastirma_Portable.exe"
    }
  }
}
```

### Vite — Electron Dışlama

Puppeteer, better-sqlite3 ve electron Vite bundle'ından dışlanır. Bu paketler Electron main process tarafından doğrudan kullanılır.

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    external: ['puppeteer', 'better-sqlite3', 'electron']
  }
},
optimizeDeps: {
  exclude: ['puppeteer', 'better-sqlite3']
}
```

---

## 14. Capacitor / Android

### Konfigürasyon (`capacitor.config.ts`)

```typescript
const config: CapacitorConfig = {
  appId: 'com.endustriyel.karsilastirma',
  appName: 'Endustriyel Karsilastirma',
  webDir: 'dist'   // Vite build çıktısı
}
```

### Android Proje Yapısı

```
android/
├── app/
│   ├── build.gradle
│   ├── capacitor.build.gradle
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── assets/public/          ← Vite build çıktısı kopyalanır
│       └── java/com/endustriyel/karsilastirma/
│           └── MainActivity.java
```

### Komutlar

```bash
# Build + Android'e sync
npm run android:sync
# → npm run build && npx cap sync android

# Android Studio'da aç
npm run android:open
# → npx cap open android
```

### Kısıtlamalar

- Puppeteer Android'de çalışmaz (Node.js ortamı yok)
- SQLite Android'de çalışmaz (Electron yok)
- Scraping ve DB işlemleri localStorage'a fallback yapar
- Gerçek scraping için backend proxy gerekir

---

## 15. Build & Deployment

### Geliştirme

```bash
# Web geliştirme sunucusu (port 5173)
npm run dev

# Electron + web sunucusu birlikte
npm run electron:dev
# → concurrently "npm run dev" "wait-on http://localhost:5173 && electron ."
```

### Production Build

```bash
# Web build (dist/ klasörüne)
npm run build
# → tsc -b && vite build

# Electron portable .exe
npm run electron:build
# → npm run build && electron-builder
# Çıktı: dist_electron/Endustriyel_Karsilastirma_Portable.exe

# Android APK
npm run android:sync
# → npm run build && npx cap sync android
# Sonra Android Studio'da APK/AAB üret
```

### Vercel Deployment

`vercel.json` mevcut. Web versiyonu Vercel'e deploy edilebilir.

```
Not: Vercel'de Puppeteer ve SQLite çalışmaz.
Web versiyonu sadece localStorage + mock data ile çalışır.
```

### TypeScript Konfigürasyonu

```
tsconfig.json          ← Referans konfigürasyon
tsconfig.app.json      ← React uygulama (src/)
tsconfig.node.json     ← Node.js araçları (vite.config.ts, electron/)
```

---

## 16. Güvenlik

### Electron Güvenlik

- `nodeIntegration: false` — Renderer'da Node.js API'si yok
- `contextIsolation: true` — Preload ve renderer izole
- IPC üzerinden tip-güvenli API köprüsü
- Preload script ile minimum yüzey alanı

### Web Güvenliği

- Tüm kullanıcı girdileri `applyFilters()` içinde string operasyonlarla işlenir
- localStorage verileri JSON.parse ile ayrıştırılır, try/catch ile korunur
- Scraper URL'leri konfigürasyon dosyasından gelir, kullanıcı girdisi değil

### Bilinen Riskler

| Risk | Seviye | Durum |
|------|--------|-------|
| CORS — Tarayıcıda cross-origin scraping | Yüksek | Electron gerektirir |
| localStorage veri bütünlüğü | Düşük | JSON parse korumalı |
| Puppeteer sandbox devre dışı | Orta | Electron ortamında kabul edilebilir |
| Kullanıcı girişi sanitizasyonu | Orta | Arama/filtre için gerekli |

---

## 17. Performans

### Bundle Optimizasyonu

- Puppeteer, better-sqlite3, electron Vite bundle'ından dışlanır
- Route-based code splitting (React Router lazy loading — henüz uygulanmadı)
- CSS Modules ile scoped stiller (global CSS kirliliği yok)

### Veri Yükleme

- İlk yüklemede 6 ürün gösterilir, "Daha Fazla" ile artırılır
- `useMemo` ile istatistik ve trend hesaplamaları önbelleklenir
- Scraping sonuçları 24 saat localStorage'da tutulur

### Scraping Performansı

- İstekler arası 1000ms rate limiting
- 3 retry denemesi (2000ms backoff)
- 30 saniye sayfa yükleme timeout
- Paralel scraping: `scrapeMultiple()` ile toplu işlem

### Recharts

Kurulu ama henüz aktif değil. Phase 5.1 (fiyat geçmişi grafiği) ve Phase 5.4 (dashboard raporlama) için hazır.

---

## 18. Bilinen Eksikler & Yol Haritası

Detaylı yol haritası için `ROADMAP.md` dosyasına bakın. Aşağıda teknik açıdan kritik eksikler özetlenmiştir.

### Phase 0 — Domain Kritik (Endüstriyel Zorunluluklar)

Bu eksikler kapatılmadan uygulama endüstriyel ortamda kullanılamaz.

**0.1 Birim Standardizasyonu**
- `UnitConversionService` servisi yok
- Kumaşta GSM+en ile Kg↔Metre dönüşümü yapılamıyor
- İplikte Ne+bobin dönüşümü yok
- `Product` tipine `baseUnit` ve `conversionRate` alanları eklenmeli
- Karşılaştırma ortak birim üzerinden yapılmalı

**0.2 MOQ + Kademeli Fiyat**
- `price: number` yerine `pricingTiers: { minQty, maxQty?, price }[]` gerekli
- `moq` alanı eksik
- Kullanıcı "Hedef Alım Miktarı" giremez
- Kademeye göre karşılaştırma yapılamaz

**0.3 Excel/CSV Import**
- Tedarikçi fiyat listesi yükleme yok
- Sütun eşleme UI yok
- ExcelJS ile parse altyapısı kurulmalı

### Phase 1 — Kritik Buglar

| ID | Sorun | Etki |
|----|-------|------|
| 1.1 | Sidebar filtreler hardcoded | Dinamik veri yok |
| 1.2 | Stok filtresi UI eksik | `toggleStockStatus` var ama görünmüyor |
| 1.3 | Header arama çalışmıyor | Sadece navigasyon |
| 1.4 | Favoriler persist edilmiyor | Sayfa yenileyince sıfırlanıyor |
| 1.5 | Profil menüsü placeholder | Ayarlar sayfası yok |

### Phase 3 — Veri Altyapısı

- Mock data bağımlılığı kaldırılmalı
- Gerçek scraper entegrasyonu (CORS proxy gerekli)
- Cache service kullanım durumu netleştirilmeli

### Phase 4 — Kod Kalitesi (Teknik Borç)

| ID | Görev |
|----|-------|
| 4.1 | `store/index.ts` → 6 ayrı dosyaya bölme |
| 4.2 | `exportService.ts` → `services/export/` dizinine bölme |
| 4.3 | `ProductCard` → `components/features/ProductCard.tsx` olarak çıkarma |
| 4.4 | `types/index.ts` → domain bazlı bölme |
| 4.5 | `globals.css` → `reset.css`, `variables.css`, `base.css` |
| 4.6 | Kullanılmayan tipler temizliği (ExportOptions, ApiResponse, PaginatedResponse) |
| 4.7 | `console.log` debug statement temizliği |

### Phase 6 — Mimari Kanca Noktaları

**6.1 Multi-Currency**
- `CurrencyStore` iskeleti
- `Product` tipine `originalCurrency` ekleme
- TCMB/API kur çekme altyapısı

**6.2 Scraper Health Check**
- `consecutiveFailures` sayacı
- `status: healthy | degraded | broken`
- 3 başarısız = broken statüsü

**6.3 PriceHistory Time-Series**
- SQLite `price_history` tablosu
- Her scraping'de fiyat değişimi loglanması
- Recharts ile grafik

**6.4 Background Scheduler**
- Electron main process'te `node-cron`
- Zamanlanmış scraping
- Desktop Notification

---

## Mimari Kararlar (ADR Özeti)

Detaylı ADR'lar için `.antigravity/` klasörüne bakın.

| ADR | Karar | Gerekçe |
|-----|-------|---------|
| ADR-001 | React 19 + TypeScript + Vite | Hız, tip güvenliği, ekosistem |
| ADR-002 | Zustand (Redux yerine) | Daha az boilerplate, persist desteği |
| ADR-003 | CSS Modules (Tailwind yerine) | Scoped stiller, framework bağımsızlığı |
| ADR-004 | Puppeteer (Cheerio yerine) | JS-heavy siteler için gerekli |
| ADR-005 | Çift mod DB (SQLite + localStorage) | Electron ve web uyumluluğu |
| ADR-006 | Cockpit dark tema | Endüstriyel kullanıcı profili |
| ADR-007 | Bento grid dashboard | Modern, veri yoğun arayüz |
| ADR-008 | ExcelJS (xlsx yerine) | Zengin stil desteği, çok sayfalı |

---

## Geliştirici Notları

### Yeni Scraper Ekleme

1. `src/scrapers/sites/YeniScraper.ts` oluştur
2. `BaseScraper`'ı extend et, `scrape()` metodunu implement et
3. `src/scrapers/scraperConfigs.ts`'e konfigürasyon ekle
4. `src/scrapers/index.ts`'e export ekle
5. `scraperLoader.ts`'e ID → sınıf eşlemesi ekle

### Yeni Store Eklemek

```typescript
// src/store/index.ts içine ekle
interface YeniStore {
  // state
  // actions
}

export const useYeniStore = create<YeniStore>()(
  persist(
    (set, get) => ({
      // implementasyon
    }),
    { name: 'yeni-store' }
  )
);
```

### Mock Data Güncelleme

`src/services/mockDataService.ts` → `getMockProducts()` fonksiyonunu düzenle.

### Electron IPC Yeni Handler

```javascript
// electron/main.cjs
ipcMain.handle('kanal:isim', async (event, params) => {
  // işlem
  return { success: true, data: sonuc };
});
```

```typescript
// src/types/electron.d.ts — ElectronAPI interface'ine ekle
kanal: {
  isim(params): Promise<ApiResponse<Sonuc>>
}
```

---

*Bu dökümantasyon projenin mevcut durumunu yansıtır. Değişiklikler yapıldıkça güncellenmelidir.*

**OLUŞTURULMA**: Mart 2026  
**DURUM**: Aktif Geliştirme
