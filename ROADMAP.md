# 🔍 Uygulama Denetim Raporu & Yol Haritası

**Endüstriyel Karşılaştırma — Genel Durum Analizi**
**Son Güncelleme:** 5 Mart 2026

---

## Mevcut Yapı

| Alan | Durum |
|------|-------|
| **Sayfalar** | Home, Products, Scrapers, Compare |
| **Layout** | Header, BottomNav, Sidebar (filtre) |
| **UI Bileşenleri** | Button, Card, Input, Toast, SkeletonLoader, CacheStatus |
| **Servisler** | exportService, scraperService, scraperManager, mockDataService, cacheService, databaseService |
| **Store** | Product, Filter, Comparison, Scraping, Settings, Notification (Zustand) |
| **Tip Sistemi** | Product, Supplier, Filter, Scraper, Comparison, Notification, API response tipleri |
| **Grafik** | Recharts (kurulu, henüz kullanılmıyor) |

---

## Phase 0 — Domain Critical (Sektör Zorunlulukları) 🏭

> Bu eksikler kapatılmadan uygulama endüstriyel ortamda kullanılamaz

- [ ] **0.1** 📐 Birim Standardizasyonu (Unit Conversion Engine) — `UnitConversionService`, kumaşta GSM+en ile Kg↔Metre dönüşümü, iplikte Ne+bobin dönüşümü, `baseUnit` ve `conversionRate` alanları, karşılaştırma ortak birim üzerinden
- [ ] **0.2** 💰 MOQ + Kademeli Fiyat (Tiered Pricing) — `price: number` yerine `pricingTiers: { minQty, maxQty?, price }[]`, `moq` alanı, kullanıcının "Hedef Alım Miktarı" girişi, kademeye göre karşılaştırma
- [ ] **0.3** 📥 Offline İçe Aktarma (Excel/CSV Import) — Tedarikçi fiyat listesi yükleme, sütun eşleme UI, önizleme tablosu, merge stratejisi (güncelle/yeni ekle), ExcelJS ile parse

---

## Phase 1 — Kritik Eksikler & Buglar

> Kullanıcı deneyimini doğrudan etkileyen sorunlar

- [ ] **1.1** Sidebar filtre hardcoded veriler → dinamik olmalı
- [ ] **1.2** Sidebar stok filtresi eksik (toggleStockStatus var ama UI yok)
- [ ] **1.3** Header arama çalışmıyor (sadece navigasyon)
- [ ] **1.4** Kullanılmayan UI bileşenleri kontrol (Button, Card, Input)
- [ ] **1.5** Profil menüsü placeholder (statik kullanıcı, Ayarlar sayfası yok)

---

## Phase 2 — UX & Tasarım İyileştirmeleri

> Kullanılabilirlik ve görsel tutarlılık

- [ ] **2.1** Loading / Error / Empty state tutarlılığı (Compare, Scrapers, Home)
- [ ] **2.2** ProductDetailModal cockpit temasına uyumlama
- [ ] **2.3** Sidebar filtre cockpit temasına uyumlama
- [ ] **2.4** ⌘K klavye kısayolu (ya çalışsın ya kaldırılsın)
- [ ] **2.5** Responsive birleşik test (BottomNav + Sidebar + Header)

---

## Phase 3 — Veri & Altyapı

> Sağlamlık ve veri bütünlüğü

- [ ] **3.1** Favoriler persist edilmiyor (sayfa yenileyince sıfırlanıyor)
- [ ] **3.2** Cache service kullanım durumu netleştirilmeli
- [ ] **3.3** Mock data bağımlılığı — gerçek scraper entegrasyonu
- [ ] **3.4** Scraper fonksiyonelliği — CORS, backend proxy gereksinimi

---

## Phase 4 — Kod Kalitesi & Bakım

> Teknik borç temizliği

- [ ] **4.1** Store monolith → `store/` dizinine 6 ayrı dosya (`useProductStore.ts`, `useFilterStore.ts`, `useComparisonStore.ts`, `useScrapingStore.ts`, `useSettingsStore.ts`, `useNotificationStore.ts`) + barrel `index.ts`
- [ ] **4.2** Export service → `services/export/` dizinine bölme: `excelExport.ts`, `csvExport.ts`, `pdfExport.ts`, `pdfComparisonExport.ts`, `theme.ts` (renk paleti) + barrel `index.ts`
- [ ] **4.3** ProductCard → `Products.tsx`'den çıkarıp `components/features/ProductCard.tsx` olarak ayrı bileşen (Compare'de de kullanılabilir)
- [ ] **4.4** Types → Domain bazlı bölme: `product.ts`, `supplier.ts`, `scraper.ts`, `comparison.ts`, `filter.ts`, `app.ts`, `api.ts` + barrel `index.ts`
- [ ] **4.5** globals.css → `reset.css`, `variables.css`, `base.css` olarak 3'e bölme
- [ ] **4.6** Unused types temizliği (ExportOptions, ApiResponse, PaginatedResponse)
- [ ] **4.7** console.log debug statement temizliği

---

## Phase 5 — Yeni Özellikler 🚀

> Uygulamayı bir üst seviyeye taşıyacak özellikler

- [ ] **5.1** 📊 Fiyat geçmişi grafiği (recharts sparkline + trend analizi)
- [ ] **5.2** 🔔 Fiyat alarmı (hedef fiyat belirleme + bildirim)
- [ ] **5.3** ⭐ Favoriler sayfası (dedicated sayfa + BottomNav tab)
- [ ] **5.4** 📈 Dashboard raporlama sayfası (recharts ile metrikler)
- [ ] **5.5** 🔗 Tedarikçi profil sayfası (ürünler, skor, iletişim)
- [ ] **5.6** 📱 PWA desteği (offline, push notification, manifest)
- [ ] **5.7** 🌙 Tema değiştirici (Dark/Light/System toggle)
- [ ] **5.8** 📋 Karşılaştırma geçmişi (kaydetme + isimlendirme)
- [ ] **5.9** 🏷️ Etiket/Tag sistemi (ürünlere özel etiketler)
- [ ] **5.10** 📤 Paylaşım linkleri (URL encode state)

## Phase 6 — Mimari Kanca Noktaları 🔧

> Şimdi iskeletini kur, tam implementasyonu sonraki phase'lerde yap

- [ ] **6.1** 💱 Multi-Currency (Kur/Döviz) — CurrencyStore iskeleti, Product tipine `originalCurrency` ekleme, TCMB/API kur çekme altyapısı, UI'da "Tümünü TRY/USD/EUR göster" toggle
- [ ] **6.2** 🩺 Scraper Health Check — `consecutiveFailures` sayacı, `status: healthy|degraded|broken`, 3 başarısız = broken statüsü, UI'da kırmızı badge + bildirim
- [ ] **6.3** 📈 PriceHistory Time-Series — SQLite `price_history` tablosu (product_id, price, currency, scraped_at), her scraping'de fiyat değişimi loglanması, Recharts ile grafik
- [ ] **6.4** ⏰ Background Scheduler — Electron main process'te `node-cron`, "Her sabah 08:00'de tara", fiyat düşüşünde Desktop Notification, kullanıcı ayarlanabilir schedule

---

## Öncelik Matrisi

| Phase | Zorluk | Etki | Öncelik |
|-------|--------|------|---------|
| **P0** Domain Critical | 🔴 Zor | 🔴 Kritik | ⭐⭐⭐⭐ |
| **P1** Kritik Eksikler | 🟢 Kolay | 🔴 Yüksek | ⭐⭐⭐ |
| **P2** UX İyileştirme | 🟡 Orta | 🟡 Orta | ⭐⭐ |
| **P3** Veri Altyapı | 🔴 Zor | 🔴 Yüksek | ⭐⭐⭐ |
| **P4** Kod Kalitesi | 🟡 Orta | 🟢 Düşük | ⭐ |
| **P5** Yeni Özellikler | 🔴 Zor | 🔴 Yüksek | ⭐⭐ |
| **P6** Mimari Kancalar | 🟡 Orta | 🔴 Yüksek | ⭐⭐⭐ |

> **Önerilen Sıralama**: P0 (Domain) → P6.2 (Health Check) → P1 → P6.1 (Currency) → P3 → P6.3 (PriceHistory) → P2 → P5 → P6.4 (Scheduler) → P4
