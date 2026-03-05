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

- [ ] **4.1** Store monolith → ayrı dosyalara bölünmeli (6 ayrı store)
- [ ] **4.2** Export service boyutu (41KB) → PDF/Excel/CSV ayrı dosyalara
- [ ] **4.3** Unused types temizliği (ExportOptions, AppSettings, ApiResponse, PaginatedResponse)
- [ ] **4.4** console.log debug statement temizliği

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

---

## Öncelik Matrisi

| Phase | Zorluk | Etki | Öncelik |
|-------|--------|------|---------|
| **P1** Kritik Eksikler | 🟢 Kolay | 🔴 Yüksek | ⭐⭐⭐ |
| **P2** UX İyileştirme | 🟡 Orta | 🟡 Orta | ⭐⭐ |
| **P3** Veri Altyapı | 🔴 Zor | 🔴 Yüksek | ⭐⭐⭐ |
| **P4** Kod Kalitesi | 🟡 Orta | 🟢 Düşük | ⭐ |
| **P5** Yeni Özellikler | 🔴 Zor | 🔴 Yüksek | ⭐⭐ |

> **Önerilen Sıralama**: P1 → P3 → P2 → P5 → P4
