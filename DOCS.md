# 📘 Teknik Dokümantasyon

**Endüstriyel Karşılaştırma — Tam Teknik Referans**
**Versiyon:** 0.1.0
**Son Güncelleme:** 5 Mart 2026
**Canlı URL:** https://endustriyel-karsilastirma.vercel.app/
**GitHub:** https://github.com/Fastrree/endustriyel-karsilastirma

---

## İçindekiler

1. [Proje Amacı & Vizyon](#1-proje-amacı--vizyon)
2. [Mimari Genel Bakış](#2-mimari-genel-bakış)
3. [Teknoloji Yığını](#3-teknoloji-yığını)
4. [Dizin Yapısı](#4-dizin-yapısı)
5. [Sayfa Analizi](#5-sayfa-analizi)
6. [Bileşen Mimarisi](#6-bileşen-mimarisi)
7. [State Management (Zustand)](#7-state-management-zustand)
8. [Servis Katmanı](#8-servis-katmanı)
9. [Tip Sistemi (TypeScript)](#9-tip-sistemi-typescript)
10. [Tasarım Sistemi](#10-tasarım-sistemi)
11. [Export & Raporlama](#11-export--raporlama)
12. [Scraper Altyapısı](#12-scraper-altyapısı)
13. [Bildirim Sistemi](#13-bildirim-sistemi)
14. [Routing & Navigation](#14-routing--navigation)
15. [Build & Deploy](#15-build--deploy)
16. [Google Lighthouse Skorları](#16-google-lighthouse-skorları)
17. [Bilinen Kısıtlamalar](#17-bilinen-kısıtlamalar)
18. [Gelecek Planı (Roadmap)](#18-gelecek-planı-roadmap)

---

## 1. Proje Amacı & Vizyon

### Problem

Endüstriyel tekstil sektöründe (iplik, kumaş, dokuma, örme, teknik tekstil) tedarikçiler arasında fiyat karşılaştırması yapmak karmaşık ve zaman alıcı bir süreçtir. Üreticiler, farklı tedarikçilerin web sitelerini tek tek ziyaret ederek ürün fiyatlarını, stok durumlarını ve teknik özelliklerini manuel olarak karşılaştırmak zorundadır.

### Çözüm

**Endüstriyel Karşılaştırma**, bu süreci otomatize eden modern bir web uygulamasıdır:

- **Web scraping** ile tedarikçi sitelerinden otomatik veri çekme
- **Yan yana karşılaştırma** ile ürünleri teknik özellik bazında değerlendirme
- **Dashboard raporlama** ile fiyat analizi, trend takibi ve karar desteği
- **Excel/CSV/PDF export** ile profesyonel raporlar oluşturma
- **Favori sistemi** ile takip edilmek istenen ürünleri kaydetme

### Hedef Kullanıcı

- Tekstil üreticileri ve satın alma departmanları
- Tedarik zinciri yöneticileri
- Fiyat analisti ve pazar araştırmacıları

### Vizyon

Tek bir platformda tüm endüstriyel tedarikçileri izleyebilen, fiyat trendlerini analiz eden ve otomatik alarm sistemleriyle karar desteği sağlayan **endüstriyel istihbarat aracı** olmak.

---

## 2. Mimari Genel Bakış

```
┌──────────────────────────────────────────────────────────┐
│                     KULLANICI (Browser)                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Home   │  │ Products │  │ Compare  │  │ Scrapers │ │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │            │             │              │        │
│  ┌────┴────────────┴─────────────┴──────────────┴────┐  │
│  │              ZUSTAND STATE MANAGEMENT             │  │
│  │  ProductStore│FilterStore│ComparisonStore│NotifStore│  │
│  └────┬────────────┬─────────────┬──────────────┬────┘  │
│       │            │             │              │        │
│  ┌────┴────────────┴─────────────┴──────────────┴────┐  │
│  │                 SERVİS KATMANI                    │  │
│  │  ExportService│CacheService│MockDataService       │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│              ELECTRON MAIN PROCESS (gelecek)             │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ScraperService (Puppeteer) │ ScraperManager      │  │
│  │  DatabaseService (SQLite)   │ CacheService        │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Mimari Kararlar

| Karar | Neden |
|-------|-------|
| **SPA (Single Page App)** | Hızlı navigasyon, state korunması |
| **Client-side rendering** | Vercel'de kolay deploy, backend gerektirmez |
| **Zustand (Redux değil)** | Minimal boilerplate, TypeScript dostu |
| **CSS Modules (Tailwind değil)** | Tam kontrol, zero-runtime, scoped styling |
| **Vite (CRA değil)** | 10x daha hızlı HMR, modern ESM |
| **ExcelJS (SheetJS değil)** | Styling desteği, dashboard formatlaması |

---

## 3. Teknoloji Yığını

### Runtime Dependencies

| Paket | Versiyon | Amaç |
|-------|----------|------|
| `react` | ^19.2.0 | UI framework |
| `react-dom` | ^19.2.0 | DOM rendering |
| `react-router-dom` | ^7.13.1 | Client-side routing |
| `zustand` | ^5.0.11 | State management |
| `lucide-react` | ^0.576.0 | Ikon kütüphanesi (290+ ikon) |
| `exceljs` | ^4.4.0 | Excel (.xlsx) oluşturma |
| `recharts` | ^3.7.0 | Grafik kütüphanesi (gelecek faz) |
| `axios` | ^1.13.6 | HTTP istekleri |
| `puppeteer` | ^24.37.5 | Headless browser scraping |
| `cheerio` | ^1.2.0 | HTML parsing (lightweight) |
| `better-sqlite3` | ^12.6.2 | Yerel SQLite veritabanı |
| `xlsx` | ^0.18.5 | Ek Excel desteği |
| `@capacitor/core` | ^8.1.0 | Mobil uygulama altyapısı |

### Dev Dependencies

| Paket | Versiyon | Amaç |
|-------|----------|------|
| `vite` | ^7.3.1 | Build tool & dev server |
| `typescript` | ~5.9.3 | Tip güvenliği |
| `electron` | ^40.6.1 | Desktop uygulama |
| `electron-builder` | ^26.8.1 | Electron paketleme |
| `eslint` | ^9.39.1 | Kod kalitesi |
| `concurrently` | ^9.2.1 | Paralel script çalıştırma |

### Toplam Bağımlılık Sayısı

- **Runtime:** 13 paket
- **Dev:** 14 paket
- **Toplam:** 27 paket

---

## 4. Dizin Yapısı

```
endustriyel-karsilastirma/
├── public/                      # Statik dosyalar
├── electron/                    # Electron main process
│   └── main.cjs                 # Ana Electron dosyası
├── src/
│   ├── main.tsx                 # Uygulama giriş noktası
│   ├── App.tsx                  # Root component + routing
│   ├── App.module.css           # Root layout stilleri
│   ├── App.css                  # Global app stilleri
│   ├── index.css                # Reset & base styles
│   │
│   ├── components/
│   │   ├── features/            # Özel bileşenler
│   │   │   ├── ProductDetailModal.tsx    # Ürün detay modal
│   │   │   ├── ProductDetailModal.module.css
│   │   │   ├── ScraperPanel.tsx          # Scraper panel
│   │   │   ├── ScraperPanel.module.css
│   │   │   ├── ScraperTestPanel.tsx      # Test paneli
│   │   │   └── ScraperTestPanel.module.css
│   │   │
│   │   ├── layout/              # Layout bileşenleri
│   │   │   ├── Header.tsx               # Üst navigasyon
│   │   │   ├── Header.module.css
│   │   │   ├── Sidebar.tsx              # Filtre paneli
│   │   │   ├── Sidebar.module.css
│   │   │   ├── BottomNav.tsx            # Alt navigasyon
│   │   │   └── BottomNav.module.css
│   │   │
│   │   └── ui/                  # Reusable UI bileşenleri
│   │       ├── Toast.tsx                # Bildirim sistemi
│   │       ├── Toast.module.css
│   │       ├── Button.tsx               # Buton bileşeni
│   │       ├── Button.module.css
│   │       ├── Card.tsx                 # Kart bileşeni
│   │       ├── Card.module.css
│   │       ├── Input.tsx                # Input bileşeni
│   │       ├── Input.module.css
│   │       ├── CacheStatus.tsx          # Önbellek durumu
│   │       ├── CacheStatus.module.css
│   │       ├── SkeletonLoader.tsx       # Yükleme animasyonu
│   │       └── SkeletonLoader.module.css
│   │
│   ├── pages/
│   │   ├── Home/
│   │   │   ├── Home.tsx                 # Ana sayfa (257 satır)
│   │   │   └── Home.module.css          # Ana sayfa stilleri
│   │   ├── Products/
│   │   │   ├── Products.tsx             # Ürün listesi (297 satır)
│   │   │   └── Products.module.css
│   │   ├── Compare/
│   │   │   ├── Compare.tsx              # Karşılaştırma (335 satır)
│   │   │   └── Compare.module.css
│   │   └── Scrapers/
│   │       ├── Scrapers.tsx             # Kaynak yönetimi
│   │       └── Scrapers.module.css
│   │
│   ├── services/
│   │   ├── exportService.ts             # Excel/CSV/PDF export (800+ satır)
│   │   ├── scraperService.ts            # Puppeteer scraper (594 satır)
│   │   ├── scraperManager.ts            # Scraper yöneticisi (169 satır)
│   │   ├── cacheService.ts              # Veri cache (100 satır)
│   │   ├── databaseService.ts           # SQLite servisi (400+ satır)
│   │   └── mockDataService.ts           # Demo verileri (130 satır)
│   │
│   ├── scrapers/
│   │   ├── scraperConfigs.ts            # Scraper konfigürasyonları
│   │   ├── scraperLoader.ts             # Dinamik scraper yükleme
│   │   ├── index.ts                     # Barrel export
│   │   └── sites/
│   │       ├── KumasFirsatiScraper.ts   # kumasfirsati.com scraper
│   │       ├── KumasciScraper.ts        # kumascini.com scraper
│   │       └── TekstilTurkiyeScraper.ts # tekstilturkiye.com scraper
│   │
│   ├── store/
│   │   └── index.ts                     # Tüm Zustand store'ları (551 satır)
│   │
│   ├── types/
│   │   ├── index.ts                     # Tüm TypeScript tipleri (194 satır)
│   │   └── electron.d.ts               # Electron tip tanımları
│   │
│   ├── styles/
│   │   ├── globals.css                  # Global CSS değişkenleri
│   │   └── animations.css              # Keyframe animasyonlar
│   │
│   ├── hooks/
│   │   └── useDatabase.ts              # Veritabanı hook'u
│   │
│   └── db/                             # Veritabanı ilgili dosyalar
│
├── .gitignore                   # Git ignore kuralları
├── vercel.json                  # Vercel SPA routing yapılandırması
├── package.json                 # Bağımlılıklar & scripts
├── tsconfig.json                # TypeScript ana yapılandırma
├── tsconfig.app.json            # App TypeScript yapılandırması
├── tsconfig.node.json           # Node TypeScript yapılandırması
├── vite.config.ts               # Vite yapılandırması
├── eslint.config.js             # ESLint yapılandırması
├── ROADMAP.md                   # Geliştirme yol haritası
├── README.md                    # Proje tanıtım dosyası
└── DOCS.md                      # Bu dosya
```

### Dosya İstatistikleri

| Metrik | Değer |
|--------|-------|
| **Toplam kaynak dosya** | 81 |
| **TypeScript dosyaları** | ~30 |
| **CSS Module dosyaları** | ~18 |
| **Toplam satır (tahmini)** | ~6,000+ |
| **En büyük dosya** | `exportService.ts` (800+ satır, 42KB) |

---

## 5. Sayfa Analizi

### 5.1 Ana Sayfa (`/`)

**Dosya:** `src/pages/Home/Home.tsx` (257 satır)

**İçerik:**
- Hero section: Başlık, açıklama, CTA butonları (Ürünleri Keşfet, Karşılaştır)
- İstatistik kartları: Toplam ürün, aktif kaynak, karşılaştırma kapasitesi
- Hızlı erişim kartları: Feature showcase (Akıllı Arama, Karşılaştırma, Rapor, Anlık Veri)
- Fiyat trendi section: Mock sparkline verisi
- Son aktivite: Kullanıcı işlem geçmişi (mock)

**Veri Kaynağı:** `useProductStore`, `useComparisonStore`, `getMockProducts()`

**Özellikler:**
- `useMemo` ile hesaplanan istatistikler (gereksiz re-render önleme)
- `useNavigate` ile programmatik routing
- Ürün sayısı, favori sayısı, karşılaştırma doluluk oranı hesaplaması

---

### 5.2 Ürünler Sayfası (`/products`)

**Dosya:** `src/pages/Products/Products.tsx` (297 satır)

**İçerik:**
- Header: Ürün sayısı badge, filtreleme butonu, export dropdown
- Arama çubuğu: Ürün ve tedarikçi arama
- Sıralama: En Yeni, Fiyat ↑/↓, A→Z / Z→A
- Ürün grid: 3 sütun, responsive kart düzeni
- Tümünü Göster / Daha Az Göster: İlk 6 ürün, geri kalanı toggle

**Alt Bileşen — ProductCard:**
- Kategori badge, favori yıldızı (toggle)
- Ürün adı, açıklama (truncated)
- Spec chips (ilk 3 özellik)
- Fiyat + birim gösterimi
- Tedarikçi adı, stok durumu badge
- Aksiyon butonları: Siteye Git, Karşılaştır

**Export Dropdown:**
- Excel Raporu (dashboard + detay + fiyat analizi)
- CSV (ham veri, tablo programları için)
- PDF Rapor (görsel dashboard, yazdırılabilir)

**Bildirimler:** Her aksiyon toast notification ile geri bildirim veriyor:
- ✅ Excel/CSV/PDF indirildi
- ✅/ℹ️ Favorilere eklendi/çıkarıldı
- ✅ Karşılaştırmaya eklendi

---

### 5.3 Karşılaştırma Sayfası (`/compare`)

**Dosya:** `src/pages/Compare/Compare.tsx` (335 satır)

**İçerik:**
- Header: Karşılaştırma sayacı (X/4 ürün), Temizle, İndir dropdown
- Fiyat analiz kartları: En Düşük (yeşil), Ortalama (mavi), En Yüksek (kırmızı)
- Ürün kartları: Görsel, fiyat, stok, tedarikçi, spec listesi, favori/siteye git
- Özellik karşılaştırma tablosu: HTML table ile yan yana tüm spec'ler

**Boş State:** Karşılaştırma listesi boşken özel UI — "Ürünlere Git" yönlendirmesi

**Export:**
- Excel: `exportToExcel(products, 'comparison')` → `buildComparisonReport()`
- CSV: `exportToCSV(products)` → standart CSV
- PDF: `exportComparisonPDF(products)` → özel karşılaştırma raporu

---

### 5.4 Kaynaklar Sayfası (`/scrapers`)

**Dosya:** `src/pages/Scrapers/Scrapers.tsx`

**İçerik:**
- Scraper panel listesi: Her kaynak için durum, son güncelleme, ürün sayısı
- Tümünü Güncelle butonu: Tüm scraper'ları çalıştırır
- Önceki Verileri Yükle: Cache'den veri yükleme
- İlerleme çubuğu: Scraping sırasında progress gösterimi
- CacheStatus bileşeni: Cache durumu ve yaşı

**Bildirimler:**
- ✅ Veriler başarıyla güncellendi
- ⚠️ Kısmen güncellendi (bazı kaynaklar hatalı)
- ❌ Güncelleme başarısız
- ℹ️ Önceki veriler yüklendi

---

## 6. Bileşen Mimarisi

### 6.1 Layout Bileşenleri

#### Header (`components/layout/Header.tsx` — 172 satır)

```
┌──────────────────────────────────────────────────────┐
│ [⚡ EK.]    [🔍 Ürün, tedarikçi ara... ⌘K]    🔔 [S] │
└──────────────────────────────────────────────────────┘
```

**Özellikler:**
- Logo: EK. — tıklandığında ana sayfaya yönlendirme
- Arama trigger: Products sayfasına navigasyon
- Bildirim zili: Okunmamış sayısı + dropdown (son 5 bildirim)
- Avatar menüsü: Kullanıcı bilgisi + Ayarlar linki
- Outside click handler: Dropdown'ları kapatma

#### BottomNav (`components/layout/BottomNav.tsx` — 54 satır)

```
┌──────────────────────────────────────────────────────┐
│    🏠 Ana Sayfa  │  📦 Ürünler  │  ⚖️ Karşılaştır  │  📡 Kaynaklar   │
└──────────────────────────────────────────────────────┘
```

**Özellikler:**
- 4 navigasyon butonu: Home, Products, Compare, Scrapers
- Aktif sayfa glow efekti
- Floating pill tasarımı (glassmorphism)
- `aria-label` ve `aria-current` erişilebilirlik

#### Sidebar (`components/layout/Sidebar.tsx` — 118 satır)

**Özellikler:**
- Overlay backdrop (tıklanınca kapanır)
- Kategori filtreleme: İplik, Kumaş, Dokuma, Örme, Teknik Tekstil
- Tedarikçi filtreleme: Korteks, SANKO, Bossa
- Fiyat aralığı: Min-Max input
- Temizle butonu: Tüm filtreleri sıfırla
- Sonuçları Göster: Panel kapatma

> ⚠️ **Bilinen sorun:** Kategoriler ve tedarikçiler şu an hardcoded. Dinamik veri çekimi ROADMAP P1'de planlanıyor.

### 6.2 Feature Bileşenleri

#### ProductDetailModal (`components/features/ProductDetailModal.tsx` — 400+ satır)

**Özellikler:**
- Ürün detay görünümü (tam modal)
- Görsel galeri, fiyat bilgisi, stok durumu
- Teknik özellikler tablosu
- Tedarikçi bilgileri ve iletişim
- Karşılaştırmaya ekle, favori toggle, siteye git

#### ScraperPanel (`components/features/ScraperPanel.tsx` — 170 satır)

**Özellikler:**
- Tekil scraper kart bileşeni
- Durum göstergesi (başarılı/hata/çalışıyor)
- Son çalıştırma zamanı
- Çekilen ürün sayısı
- Bireysel çalıştırma butonu

### 6.3 UI Bileşenleri

#### Toast (`components/ui/Toast.tsx` — 104 satır)

**Tip desteği:** success (yeşil), error (kırmızı), warning (sarı), info (mavi)

**Özellikler:**
- Sağ üstten kayma animasyonu (slide-in / slide-out)
- Otomatik kapanma: 4 saniye
- İlerleme çubuğu: Kalan süreyi gösterir
- Ikon sistemi: CheckCircle, XCircle, AlertTriangle, Info
- `useNotificationStore` ile reactive bağlantı
- Otomatik `markAsRead` çağrısı

#### SkeletonLoader (`components/ui/SkeletonLoader.tsx`)

**Varyantlar:** card, text, circle, custom
**Animasyon:** Pulse shimmer efekti

#### CacheStatus (`components/ui/CacheStatus.tsx`)

**Durumlar:** fresh (yeşil), stale (sarı), error (kırmızı), empty
**Gösterim:** Cache yaşı, ürün sayısı, son güncelleme

---

## 7. State Management (Zustand)

**Dosya:** `src/store/index.ts` (551 satır)

Uygulama 6 bağımsız store kullanır:

### 7.1 ProductStore

```typescript
interface ProductStore {
  products: Product[];
  filteredProducts: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;

  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  getProductsBySupplier: (supplierId: string) => Product[];
  getProductsByCategory: (category: string) => Product[];
  getFavoriteProducts: () => Product[];
}
```

### 7.2 FilterStore

```typescript
interface FilterStore {
  filters: FilterState;
  setSearchQuery: (query: string) => void;
  toggleCategory: (category: string) => void;
  toggleSupplier: (supplier: string) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  toggleStockStatus: (status: StockStatus) => void;
  setSortBy: (sortBy: SortOption) => void;
  resetFilters: () => void;
  applyFilters: (products: Product[]) => Product[];  // 60 satır filtreleme mantığı
}
```

**Filtreleme sırası:** searchQuery → categories → suppliers → priceRange → stockStatus → sortBy

### 7.3 ComparisonStore (Persist)

```typescript
interface ComparisonStore {
  comparison: ComparisonState;  // { items: ComparisonItem[], maxItems: 4 }
  addToComparison: (product: Product) => boolean;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
  canAddMore: () => boolean;
}
```

**Persist:** `zustand/middleware/persist` ile `localStorage`'a kayıt — sayfa yenilemelerinde korunur.

### 7.4 ScrapingStore

Scraper durumlarını (running, progress, results) tutan store.

### 7.5 SettingsStore (Persist)

```typescript
interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  language: 'tr' | 'en';
  notifications: boolean;
  autoUpdate: boolean;
  defaultCurrency: string;
}
```

### 7.6 NotificationStore

```typescript
interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
}
```

> ⚠️ **Bilinen sorun:** ProductStore `persist` kullanmıyor — favoriler sayfa yenileyince sıfırlanıyor (ROADMAP P3.1).

---

## 8. Servis Katmanı

### 8.1 ExportService (`services/exportService.ts` — 800+ satır)

En büyük servis dosyası. 5 ana metot:

| Metot | Açıklama | Çıktı |
|-------|----------|-------|
| `exportToExcel(products, type)` | Excel dashboard raporu | `.xlsx` dosyası |
| `exportToCSV(products)` | Düz CSV verisi | `.csv` dosyası |
| `exportToPDF(products)` | Genel ürün PDF raporu | HTML → yeni sekme |
| `exportComparisonPDF(products)` | Karşılaştırma PDF raporu | HTML → yeni sekme |

#### Excel Rapor Yapısı (`type: 'products'`)

4 sayfalık dashboard:

1. **Dashboard** — Başlık, tarih, özet istatistikler, fiyat dağılımı
2. **Ürünler** — Tüm ürünler tablosu (zebra striping, stok badge'leri)
3. **Fiyat Sıralaması** — Fark barları, ortalamaya göre yüzde farklar
4. **Spec Karşılaştırma** — Tüm özelliklerin yan yana tablosu

#### Excel Rapor Yapısı (`type: 'comparison'`)

1 sayfalık karşılaştırma tablosu:
- Ürün, Fiyat, Birim, Stok, Tedarikçi, Karşılaştırma sütunları
- En ucuz ürün: `⭐ En İyi (%XX uygun)` etiketi, yeşil arka plan
- Diğer ürünler: `+XX.X%` fark yüzdesi

#### PDF Rapor Yapısı (Genel)

HTML tabanlı dashboard PDF:
- Gradient brand bar (mavi → yeşil → turuncu)
- Insight kutusu: otomatik analiz metni
- 4 stat kartı: Toplam, En Düşük, Ortalama, En Yüksek
- Stok dağılım grafiği (CSS bar chart)
- Kategori & tedarikçi kırılımı
- Ürün tablosu: En İyi / En Pahalı etiketleri
- Fiyat sıralaması: Proportional fark barları
- `@media print` optimizasyonu
- `window.print()` otomatik tetikleme

#### Karşılaştırma PDF Yapısı

HTML tabanlı karşılaştırma raporu:
- Ürün kartları: Grid layout, en ucuz yeşil border + `⭐ En İyi (%XX uygun)`
- Özellik tablosu: Tüm spec'ler yan yana
- Fiyat tablosu: Ortalamaya ve en ucuza göre yüzde farklar
- Print + dark mode desteği

### 8.2 ScraperService (`services/scraperService.ts` — 594 satır)

Puppeteer tabanlı web scraper:

```
initialize() → Browser başlat
    ↓
scrapeUrl(url, config) → Tek URL scrape et
    ↓
scrapeWithRetry(url, config, 3) → 3 deneme ile retry
    ↓
performScrape(url, config) → Asıl scraping (CSS selectors)
    ↓
parsePrice(text) → "62,50 TL" → { price: 62.5, currency: "TRY" }
    ↓
saveToCache(products, config) → Cache'e kaydet
```

**Güvenlik:**
- Rate limiting: İstekler arası 1 saniye bekleme
- Timeout: 30 saniye max
- Error sınıfları: `ScraperError`, `RetryExhaustedError`
- User-Agent spoofing: Normale benzeterek bot algılamayı atlatma

### 8.3 ScraperManager (`services/scraperManager.ts` — 169 satır)

Scraper orkestrasyon katmanı:
- Ortam algılama: `typeof window === 'undefined'` → Node.js / Browser
- Browser modda: Mock data dönüyor (CORS engeli nedeniyle)
- Node modda: ScraperService'i kullanarak gerçek scraping
- Cache yönetimi: Önce cache kontrol, gerekirse scrape

### 8.4 MockDataService (`services/mockDataService.ts` — 130 satır)

8 demo ürün üretir:

| Ürün | Fiyat | Kategori |
|------|-------|----------|
| Pamuk İplik Ne 40/1 | 62 TRY | İplik |
| Viskon İplik 30/1 | 78.9 TRY | İplik |
| Polyester İplik DTY 150d/48f | 45.5 TRY | İplik |
| Pamuklu Poplin Kumaş | 28.75 TRY | Kumaş |
| Denim Kumaş 10oz | 42 TRY | Kumaş |
| Likralı Ribana | 35.2 TRY | Örme |
| Polipropilen Dokusuz Yüzey | 18.9 TRY | Teknik Tekstil |
| Modal İplik 40/1 | 95 TRY | İplik |

Her ürün: id, name, description, category, supplier, price, currency, unit, stockStatus, specifications, url, lastUpdated, scrapedAt, source

### 8.5 CacheService (`services/cacheService.ts`)

localStorage tabanlı veri önbellekleme:
- `saveCache(products, source)`: Ürünleri JSON olarak kaydet
- `getCachedProducts()`: Cache'den oku + fresh/stale durumu hesapla
- `clearCache()`: Tüm cache'i temizle
- Stale threshold: 24 saat

### 8.6 DatabaseService (`services/databaseService.ts`)

SQLite (better-sqlite3) tabanlı kalıcı depolama:
- Ürün CRUD operasyonları
- Tedarikçi yönetimi
- Scraper log kayıtları
- **Not:** Sadece Electron main process'te çalışır

---

## 9. Tip Sistemi (TypeScript)

**Dosya:** `src/types/index.ts` (194 satır)

### Ana Tipler

```typescript
// Ürün
interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  sku?: string;
  brand?: string;
  supplier: Supplier;
  price: number;
  currency: string;
  unit: string;
  minOrderQuantity?: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  specifications: ProductSpecification[];
  images?: string[];
  url?: string;
  lastUpdated: Date;
  isFavorite?: boolean;
  scrapedAt: Date;
  source: string;
  isCached?: boolean;
}

// Tedarikçi
interface Supplier {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  contactInfo?: ContactInfo;
  rating?: number;
  reliability?: number;
  lastScraped?: Date;
}

// Scraper Konfigürasyonu
interface ScraperConfig {
  id: string;
  supplierId: string;
  url: string;
  name: string;
  baseUrl: string;
  category: string;
  selectors: {
    productList: string;
    productName: string;
    productPrice: string;
    productDescription?: string;
    nextPage?: string;
  };
  schedule: 'manual' | 'hourly' | 'daily' | 'weekly';
  isActive: boolean;
  lastRun?: Date;
  lastStatus?: 'success' | 'error' | 'running';
}
```

### Tip Kullanım Durumu

| Tip | Kullanılıyor? |
|-----|--------------|
| `Product` | ✅ Her yerde |
| `Supplier` | ✅ Product içinde |
| `FilterState` | ✅ FilterStore |
| `ComparisonState` | ✅ ComparisonStore |
| `ScraperConfig` | ✅ ScraperService |
| `Notification` | ✅ NotificationStore |
| `AppSettings` | ⚠️ Store'da tanımlı ama UI'da kullanılmıyor |
| `ExportOptions` | ❌ Kullanılmıyor |
| `ApiResponse<T>` | ❌ Kullanılmıyor |
| `PaginatedResponse<T>` | ❌ Kullanılmıyor |

---

## 10. Tasarım Sistemi

### 10.1 Tema: Cockpit Dark Glass

| Özellik | Değer |
|---------|-------|
| **Arka plan** | `#06060a` → `#0c0c14` (gradient) |
| **Kart arka plan** | `rgba(255, 255, 255, 0.02)` |
| **Border** | `rgba(255, 255, 255, 0.04)` |
| **Metin (ana)** | `rgba(255, 255, 255, 0.85)` |
| **Metin (ikincil)** | `rgba(255, 255, 255, 0.4)` |
| **Accent** | `#0066FF` (mavi) |
| **Success** | `#00CC66` (yeşil) |
| **Warning** | `#FFAA00` (turuncu) |
| **Error** | `#FF4444` (kırmızı) |
| **Border radius** | `12px` (kart), `8px` (buton), `20px` (badge) |

### 10.2 Glassmorphism

```css
background: rgba(255, 255, 255, 0.02);
border: 1px solid rgba(255, 255, 255, 0.04);
backdrop-filter: blur(20px);
```

### 10.3 Tipografi

| Eleman | Font | Boyut | Ağırlık |
|--------|------|-------|---------|
| Sayfa başlığı | Segoe UI | 20px | 700 |
| Kart başlığı | Segoe UI | 14px | 600 |
| Body text | Segoe UI | 13px | 400 |
| Badge | Segoe UI | 11px | 600 |
| Caption | Segoe UI | 10px | 500 |

### 10.4 İkon Sistemi

**Kütüphane:** Lucide React (^0.576.0)

| Sayfa | Kullanılan İkonlar |
|-------|-------------------|
| Home | Search, GitCompareArrows, ArrowRight, Package, Factory, BarChart3, RefreshCw, Zap, TrendingUp, Clock, Star |
| Products | Download, Search, AlertTriangle, SearchX, SlidersHorizontal, Package, ExternalLink, GitCompareArrows, Star, ChevronDown, ChevronsDown, FileSpreadsheet, FileText, Printer |
| Compare | Download, Trash2, ChevronDown, ArrowUpRight, FileSpreadsheet, FileText, Printer, Package, ArrowLeft |
| Header | Search, Bell, Zap, Settings |
| BottomNav | Home, Package, GitCompareArrows, Radio |

### 10.5 Responsive Breakpoints

```css
@media (max-width: 768px)  { /* Tablet */ }
@media (max-width: 480px)  { /* Mobile */ }
```

#### Grid Düzenleri

| Sayfa | Desktop | Tablet | Mobile |
|-------|---------|--------|--------|
| Products | 3 sütun | 2 sütun | 1 sütun |
| Compare | 4 sütun (max) | 2 sütun | 1 sütun |
| Home stats | 4 sütun | 2 sütun | 1 sütun |

### 10.6 Animasyonlar

```css
/* Fade in (sayfalar) */
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } }

/* Slide in (toast) */
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } }

/* Shimmer (skeleton) */
@keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: calc(200px + 100%) 0; } }

/* Glow pulse (aktif nav) */
@keyframes glowPulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
```

---

## 11. Export & Raporlama

### Export Akış Diyagramı

```
Kullanıcı → İndir dropdown → Format seç
                ↓
        ┌───────┼───────┐
        │       │       │
      Excel    CSV     PDF
        │       │       │
   ExcelJS   Blob    HTML
   Workbook  text    template
        │       │       │
    .xlsx     .csv   window
   download  download .open
```

### Excel Renk Paleti

```
Header BG:     #0D1117 (koyu siyah)
Alt row:       #0A0E14 (hafif koyu)
Accent:        #0066FF (mavi)
Green:         #00CC66 (stokta/en iyi)
Red:           #FF4444 (tükendi/pahalı)
Amber:         #FFAA00 (az stok/uyarı)
Text light:    #C9D1D9 (açık gri)
```

---

## 12. Scraper Altyapısı

### Mevcut Scraper Konfigürasyonları

| Scraper | Hedef Site | Kategori | Durum |
|---------|-----------|----------|-------|
| KumasFirsatiScraper | kumasfirsati.com | Kumaş | Yazıldı |
| KumasciScraper | kumascini.com | Kumaş | Yazıldı |
| TekstilTurkiyeScraper | tekstilturkiye.com | Genel | Yazıldı |

### Scraping Pipeline

```
1. ScraperManager.runAllScrapers()
2. → Ortam kontrolü (Node.js mi?)
3. → Her aktif config için:
4.   → ScraperService.initialize() (Puppeteer browser başlat)
5.   → scrapeWithRetry(url, config, maxAttempts=3)
6.     → performScrape(url, config)
7.       → page.goto(url, { waitUntil: 'networkidle0' })
8.       → page.$$(config.selectors.productList)
9.       → Her element için:
10.        → name = element.$(config.selectors.productName).textContent
11.        → price = parsePrice(element.$(config.selectors.productPrice).textContent)
12.        → Product objesi oluştur
13.    → cacheService.saveCache(products, source)
14.    → ScrapingResult dön
```

### Ortam Kısıtlamaları

| Ortam | Scraping | Cache | Mock Data |
|-------|----------|-------|-----------|
| Browser (Vite) | ❌ CORS | ✅ localStorage | ✅ |
| Electron Renderer | ❌ CORS | ✅ localStorage | ✅ |
| Electron Main | ✅ Puppeteer | ✅ SQLite | — |
| Vercel | ❌ Serverless | — | ✅ |

---

## 13. Bildirim Sistemi

### Bildirim Akışı

```
Kullanıcı eylemi
    ↓
Component → addNotification({ type, title, message })
    ↓
NotificationStore → id + timestamp + isRead:false ekle
    ↓
ToastContainer (reactive) → Yeni bildirimi algıla
    ↓
Toast bileşeni → slideIn animasyonu ile göster
    ↓
4 saniye sonra → Otomatik kapanma + markAsRead
    ↓
Header Bell → unreadCount güncelle
```

### Bildirim Noktaları

| Sayfa | Aksiyon | Tip | Mesaj |
|-------|---------|-----|-------|
| Products | Excel indir | success | Excel İndirildi |
| Products | CSV indir | success | CSV İndirildi |
| Products | PDF indir | success | PDF Raporu |
| Products | Favori ekle | success | Favorilere Eklendi |
| Products | Favori çıkar | info | Favoriden Çıkarıldı |
| Products | Karşılaştır | success | Karşılaştırmaya Eklendi |
| Compare | Temizle | info | Liste Temizlendi |
| Compare | Favori toggle | success/info | Favorilere Eklendi/Çıkarıldı |
| Compare | Export (3 tip) | success | İlgili mesaj |
| Scrapers | Güncelle | success/warning/error | Durum mesajı |
| Scrapers | Cache yükle | info | Veriler yüklendi |

---

## 14. Routing & Navigation

### Route Yapısı

```typescript
<Routes>
  <Route path="/"          element={<Home />} />
  <Route path="/products"  element={<Products />} />
  <Route path="/scrapers"  element={<Scrapers />} />
  <Route path="/test"       element={<ScraperTestPanel />} />
  <Route path="/compare"   element={<Compare />} />
  <Route path="*"          element={<NotFound />} />
</Routes>
```

### Vercel SPA Routing

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

Tüm route'lar `index.html`'e yönlendirilir → React Router client-side'da handle eder.

---

## 15. Build & Deploy

### Scripts

```bash
npm run dev              # Vite dev server (localhost:5173)
npm run build            # tsc -b && vite build → dist/
npm run preview          # Production build preview
npm run lint             # ESLint kontrol
npm run electron:dev     # Vite + Electron paralel
npm run electron:build   # Production Electron build
npm run android:sync     # Capacitor Android sync
npm run android:open     # Android Studio aç
```

### Vite Yapılandırması

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['puppeteer', 'better-sqlite3', 'electron'],
    },
  },
  optimizeDeps: {
    exclude: ['puppeteer', 'better-sqlite3'],
  },
});
```

**Neden external?** Bu paketler Node.js-only — browser build'de dahil edilmemeli.

### Deploy Platformları

| Platform | Durum | URL |
|----------|-------|-----|
| **Vercel** | ✅ Canlı | endustriyel-karsilastirma.vercel.app |
| **Electron** | ⚠️ Build var, IPC eksik | dist_electron/ |
| **Android** | ⚠️ Capacitor kurulu, test edilmedi | android/ |

---

## 16. Google Lighthouse Skorları

**Test Tarihi:** 5 Mart 2026
**Test Ortamı:** PageSpeed Insights (Mobil simülasyonu)

### Ana Sayfa (`/`) (Mobile)

| Metrik | Skor | Durum |
|--------|------|-------|
| ⚡ Performance | **84** | 🟠 İyi |
| ♿ Accessibility | **87** | 🟠 İyi |
| ✅ Best Practices | **100** | 🟢 Mükemmel |
| 🔍 SEO | **82** | 🟠 İyi |

### Ana Sayfa (`/`) (Desktop)

| Metrik | Skor | Durum |
|--------|------|-------|
| ⚡ Performance | **100** | 🟢 Mükemmel |
| ♿ Accessibility | **95** | 🟢 Mükemmel |
| ✅ Best Practices | **100** | 🟢 Mükemmel |
| 🔍 SEO | **82** | 🟠 İyi |

### Ürünler (`/products`) (Mobile)

| Metrik | Skor | Durum |
|--------|------|-------|
| ⚡ Performance | **84** | 🟠 İyi |
| ♿ Accessibility | **80** | 🟠 İyi |
| ✅ Best Practices | **100** | 🟢 Mükemmel |
| 🔍 SEO | **82** | 🟠 İyi |

### Ürünler (`/products`) (Desktop)

| Metrik | Skor | Durum |
|--------|------|-------|
| ⚡ Performance | **100** | 🟢 Mükemmel |
| ♿ Accessibility | **87** | 🟠 İyi |
| ✅ Best Practices | **100** | 🟢 Mükemmel |
| 🔍 SEO | **82** | 🟠 İyi |

### Karşılaştırma (`/compare`) (Mobile)

| Metrik | Skor | Durum |
|--------|------|-------|
| ⚡ Performance | **84** | 🟠 İyi |
| ♿ Accessibility | **87** | 🟠 İyi |
| ✅ Best Practices | **100** | 🟢 Mükemmel |
| 🔍 SEO | **82** | 🟠 İyi |

### Karşılaştırma (`/compare`) (Desktop)

| Metrik | Skor | Durum |
|--------|------|-------|
| ⚡ Performance | **100** | 🟢 Mükemmel |
| ♿ Accessibility | **95** | 🟢 Mükemmel |
| ✅ Best Practices | **100** | 🟢 Mükemmel |
| 🔍 SEO | **82** | 🟠 İyi |

### Kaynaklar (`/scrapers`) (Mobile)

| Metrik | Skor | Durum |
|--------|------|-------|
| ⚡ Performance | **83** | 🟠 İyi |
| ♿ Accessibility | **86** | 🟠 İyi |
| ✅ Best Practices | **100** | 🟢 Mükemmel |
| 🔍 SEO | **82** | 🟠 İyi |

### Kaynaklar (`/scrapers`) (Desktop)

| Metrik | Skor | Durum |
|--------|------|-------|
| ⚡ Performance | **100** | 🟢 Mükemmel |
| ♿ Accessibility | **93** | 🟢 Mükemmel |
| ✅ Best Practices | **100** | 🟢 Mükemmel |
| 🔍 SEO | **82** | 🟠 İyi |

### Genel Ortalama

#### Mobile

| Metrik | Ortalama | Yorum |
|--------|----------|-------|
| Performance | **83.75** | İyi, lazy loading ile iyileştirilebilir |
| Accessibility | **87.5** | İyi, WCAG AA hedef |
| Best Practices | **100** | Mükemmel |
| SEO | **82** | Meta description eksik |

#### Desktop

| Metrik | Ortalama | Yorum |
|--------|----------|-------|
| Performance | **100** | Mükemmel |
| Accessibility | **92.5** | Çok iyi |
| Best Practices | **100** | Mükemmel |
| SEO | **82** | Meta description eksik |

### İyileştirme Fırsatları

**Performance (Mobile ~83):**
- Lazy loading uygulanmalı (`React.lazy()`)
- Bundle splitting (recharts, exceljs ayrı chunk)
- Unused CSS kaldırılmalı

**Accessibility (~87 mobile):**
- Tüm interactive elementlere `aria-label` eklenmeli
- Renk kontrastı bazı badge'lerde yetersiz olabilir
- Form elementlerine proper `label` bağlantısı

**SEO (82):**
- `<meta name="description">` eklenmeli
- `<title>` her sayfa için dinamik olmalı
- Open Graph meta tag'ları eklenebilir

---

## 17. Bilinen Kısıtlamalar

### Kritik

| # | Sorun | Detay |
|---|-------|-------|
| K1 | Scraper browser'da çalışmıyor | CORS engeli, Electron IPC gerekli |
| K2 | Mock data bağımlılığı | Tüm veri statik, gerçek kaynak yok |
| K3 | Favoriler persist değil | Sayfa yenileyince sıfırlanıyor |

### Orta

| # | Sorun | Detay |
|---|-------|-------|
| O1 | Hardcoded filtreler | Kategoriler, tedarikçiler dinamik değil |
| O2 | Arama çalışmıyor | Header arama sadece navigasyon |
| O3 | ⌘K kısayolu sahte | Görsel var, listener yok |
| O4 | Profil menüsü sahte | Hardcoded kullanıcı, ayarlar sayfası yok |

### Düşük

| # | Sorun | Detay |
|---|-------|-------|
| D1 | Unused types | ExportOptions, ApiResponse vb. kullanılmıyor |
| D2 | Store monolith | 551 satır tek dosya |
| D3 | ExportService boyutu | 800+ satır, bölünmeli |

---

## 18. Gelecek Planı (Roadmap)

Detaylı plan: [ROADMAP.md](./ROADMAP.md)

### Özet

| Phase | İçerik | Öncelik |
|-------|--------|---------|
| **P1** | Kritik eksikler (dinamik filtre, arama, persist) | ⭐⭐⭐ |
| **P2** | UX iyileştirme (loading state, modal tema, responsive) | ⭐⭐ |
| **P3** | Veri altyapısı (favori persist, cache, scraper gerçek entegrasyon) | ⭐⭐⭐ |
| **P4** | Kod kalitesi (store bölme, export service refactor) | ⭐ |
| **P5** | Yeni özellikler (fiyat geçmişi, alarm, dashboard, PWA) | ⭐⭐ |

---

*Bu dokümantasyon proje geliştikçe güncellenecektir.*
*Son güncelleme: 5 Mart 2026, 23:23 TSİ*
