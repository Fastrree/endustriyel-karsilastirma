# 🔬 Endüstriyel Karşılaştırma

Endüstriyel tekstil sektöründe ürün fiyatlarını karşılaştıran, analiz eden ve raporlayan modern web uygulaması.

---

## ✨ Özellikler

- **Ürün Yönetimi** — Filtreleme, arama, sıralama, favori sistemi
- **Karşılaştırma** — Yan yana ürün karşılaştırma (max 4 ürün)
- **Kaynak Yönetimi** — Web scraper konfigürasyonu ve veri güncelleme
- **Raporlama** — Excel (.xlsx dashboard), CSV, PDF (baskıya hazır) export
- **Karşılaştırma PDF** — Özel karşılaştırma raporu (fiyat analizi, özellik tablosu)
- **Toast Bildirimleri** — Tüm aksiyonlarda anlık geri bildirim
- **Responsive** — Desktop + mobil uyumlu, floating bottom navigation

## 🎨 Tasarım

- **Cockpit Dark Glass** teması — glassmorphism, gradient accents
- **Lucide React** ikonları
- **CSS Modules** — scoped styling, sıfır framework bağımlılığı
- **Recharts** — grafik altyapısı (kurulu, gelecek faz)

## 🛠️ Teknoloji

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 19, TypeScript, Vite 7 |
| State | Zustand (persist middleware) |
| Styling | CSS Modules, Vanilla CSS |
| Export | ExcelJS, HTML-to-PDF |
| Scraping | Puppeteer, Cheerio (Electron main process) |
| Desktop | Electron |
| İkonlar | Lucide React |

## 🚀 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Development server
npm run dev

# Electron ile çalıştır
npm run electron:dev

# Production build
npm run build
```

## 📁 Proje Yapısı

```
src/
├── components/
│   ├── features/     # ProductDetailModal, ScraperPanel
│   ├── layout/       # Header, BottomNav, Sidebar
│   └── ui/           # Toast, Button, Card, SkeletonLoader
├── pages/
│   ├── Home/         # Ana sayfa dashboard
│   ├── Products/     # Ürün listesi + filtre
│   ├── Compare/      # Karşılaştırma
│   └── Scrapers/     # Kaynak yönetimi
├── services/
│   ├── exportService.ts    # Excel, CSV, PDF export
│   ├── scraperService.ts   # Puppeteer scraper
│   ├── scraperManager.ts   # Scraper orchestration
│   ├── cacheService.ts     # Veri cache
│   └── mockDataService.ts  # Demo verileri
├── store/            # Zustand state management
├── types/            # TypeScript tip tanımları
└── styles/           # Global stiller, animasyonlar
```

## 📋 Yol Haritası

Detaylı yol haritası için [ROADMAP.md](./ROADMAP.md) dosyasına bakın.

## 📄 Lisans

MIT
