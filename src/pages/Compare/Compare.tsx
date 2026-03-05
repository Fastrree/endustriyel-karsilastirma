import React, { useState, useRef, useEffect } from 'react';
import styles from './Compare.module.css';
import { useComparisonStore, useProductStore, useNotificationStore } from '../../store';
import type { Product } from '../../types';
import { ExportService } from '../../services/exportService';
import {
  TrendingDown, TrendingUp, Package, Store, Calendar, Scale,
  X, Download, Trash2, Check, AlertTriangle, XCircle,
  ArrowUpRight, ChevronDown, FileSpreadsheet, FileText, FileDown
} from 'lucide-react';

export const Compare: React.FC = () => {
  const { comparison, removeFromComparison, clearComparison } = useComparisonStore();
  const { products, toggleFavorite } = useProductStore();
  const { addNotification } = useNotificationStore();

  const { items, maxItems } = comparison;

  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getProductWithCurrentStatus = (product: Product) => {
    const updated = products.find(p => p.id === product.id);
    return updated || product;
  };

  const compProducts = items.map(i => i.product);
  const prices = items.map(item => item.product.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const priceDiffPercent = ((maxPrice - minPrice) / minPrice * 100).toFixed(1);

  const allSpecKeys = Array.from(
    new Set(items.flatMap(item => item.product.specifications.map(spec => spec.key)))
  );

  const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
    setExportOpen(false);
    try {
      if (format === 'excel') {
        await ExportService.exportToExcel(compProducts, 'comparison');
        addNotification({ type: 'success', title: 'Excel İndirildi', message: 'Karşılaştırma raporu başarıyla oluşturuldu.' });
      } else if (format === 'csv') {
        ExportService.exportToCSV(compProducts);
        addNotification({ type: 'success', title: 'CSV İndirildi', message: 'Veriler CSV formatında indirildi.' });
      } else {
        ExportService.exportComparisonPDF(compProducts);
        addNotification({ type: 'success', title: 'PDF Raporu', message: 'Rapor yeni sekmede açıldı.' });
      }
    } catch {
      addNotification({ type: 'error', title: 'Hata', message: 'Rapor oluşturulurken bir hata oluştu.' });
    }
  };

  // ---- Empty State ----
  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Scale size={48} />
          </div>
          <h2>Karşılaştırma Listesi Boş</h2>
          <p>Ürünler sayfasından en fazla {maxItems} ürünü karşılaştırmak üzere ekleyebilirsiniz.</p>
          <button className={styles.emptyBtn} onClick={() => window.location.href = '/products'}>
            <ArrowUpRight size={18} /> Ürünlere Git
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ---- Header ---- */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Scale size={18} />
          </div>
          <div>
            <h1 className={styles.title}>
              Karşılaştırma
              <span className={styles.countBadge}>{items.length} / {maxItems}</span>
            </h1>
            <p className={styles.subtitle}>Ürünleri yan yana karşılaştırın</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.clearBtn} onClick={() => {
            clearComparison();
            addNotification({ type: 'info', title: 'Liste Temizlendi', message: 'Tüm ürünler karşılaştırma listesinden kaldırıldı.' });
          }}>
            <Trash2 size={16} /> Temizle
          </button>

          <div className={styles.exportWrap} ref={exportRef}>
            <button className={styles.exportBtn} onClick={() => setExportOpen(!exportOpen)}>
              <Download size={16} /> İndir
              <ChevronDown size={14} className={exportOpen ? styles.chevronUp : ''} />
            </button>
            {exportOpen && (
              <div className={styles.exportDropdown}>
                <button className={styles.exportItem} onClick={() => handleExport('excel')}>
                  <FileSpreadsheet size={18} className={styles.exportItemIconGreen} />
                  <span className={styles.exportItemText}>
                    <span className={styles.exportItemTitle}>Excel Raporu</span>
                    <span className={styles.exportItemDesc}>Dashboard + detay + fiyat analizi</span>
                  </span>
                </button>
                <button className={styles.exportItem} onClick={() => handleExport('csv')}>
                  <FileText size={18} className={styles.exportItemIconBlue} />
                  <span className={styles.exportItemText}>
                    <span className={styles.exportItemTitle}>CSV Verisi</span>
                    <span className={styles.exportItemDesc}>Düz veri, tablo uyumlu</span>
                  </span>
                </button>
                <button className={styles.exportItem} onClick={() => handleExport('pdf')}>
                  <FileDown size={18} className={styles.exportItemIconPurple} />
                  <span className={styles.exportItemText}>
                    <span className={styles.exportItemTitle}>PDF Raporu</span>
                    <span className={styles.exportItemDesc}>Baskıya hazır analiz raporu</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ---- Price Analysis ---- */}
      {items.length > 1 && (
        <div className={styles.analysisSection}>
          <h3 className={styles.sectionTitle}>Fiyat Analizi</h3>
          <div className={styles.analysisGrid}>
            <div className={styles.analysisCard}>
              <div className={`${styles.analysisIcon} ${styles.green}`}>
                <TrendingDown size={20} />
              </div>
              <div className={styles.analysisContent}>
                <span className={styles.analysisLabel}>En Ucuz</span>
                <span className={styles.analysisValue}>{minPrice.toLocaleString('tr-TR')} TRY</span>
                <span className={styles.analysisProduct}>
                  {items.find(i => i.product.price === minPrice)?.product.name}
                </span>
              </div>
            </div>

            <div className={styles.analysisCard}>
              <div className={`${styles.analysisIcon} ${styles.red}`}>
                <TrendingUp size={20} />
              </div>
              <div className={styles.analysisContent}>
                <span className={styles.analysisLabel}>En Pahalı</span>
                <span className={styles.analysisValue}>{maxPrice.toLocaleString('tr-TR')} TRY</span>
                <span className={styles.analysisProduct}>
                  {items.find(i => i.product.price === maxPrice)?.product.name}
                </span>
              </div>
            </div>

            <div className={styles.analysisCard}>
              <div className={`${styles.analysisIcon} ${styles.amber}`}>
                <Scale size={20} />
              </div>
              <div className={styles.analysisContent}>
                <span className={styles.analysisLabel}>Ortalama</span>
                <span className={styles.analysisValue}>{avgPrice.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TRY</span>
                <span className={styles.analysisProduct}>Fark: %{priceDiffPercent}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- Product Cards ---- */}
      <div className={styles.productsGrid} style={{
        gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`
      }}>
        {items.map(({ product: originalProduct }) => {
          const product = getProductWithCurrentStatus(originalProduct);
          return (
            <div key={product.id} className={styles.productCard}>
              <button className={styles.removeBtn} onClick={() => removeFromComparison(product.id)} title="Kaldır">
                <X size={16} />
              </button>

              <div className={styles.imageWrapper}>
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} />
                ) : (
                  <div className={styles.placeholderImage}>
                    <Package size={40} />
                  </div>
                )}
              </div>

              <div className={styles.productInfo}>
                <span className={styles.category}>{product.category}</span>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.supplier}><Store size={13} /> {product.supplier.name}</p>
              </div>

              <div className={styles.priceSection}>
                <div className={styles.priceWrapper}>
                  <span className={`${styles.price} ${product.price === minPrice && items.length > 1 ? styles.bestPrice : ''}`}>
                    {product.price.toLocaleString('tr-TR')}
                    <span className={styles.currency}>{product.currency}</span>
                  </span>
                  <span className={styles.unit}>/ {product.unit}</span>
                </div>
                {product.price === minPrice && items.length > 1 && (
                  <span className={styles.bestPriceBadge}>⭐ En İyi Fiyat</span>
                )}
                {items.length > 1 && product.price !== minPrice && (
                  <span className={styles.priceDiff}>
                    +{((product.price - minPrice) / minPrice * 100).toFixed(1)}%
                  </span>
                )}
              </div>

              <div className={styles.stockSection}>
                <span className={`${styles.stock} ${styles[product.stockStatus]}`}>
                  {product.stockStatus === 'in_stock' && <><Check size={14} /> Stokta</>}
                  {product.stockStatus === 'low_stock' && <><AlertTriangle size={14} /> Az Stok</>}
                  {product.stockStatus === 'out_of_stock' && <><XCircle size={14} /> Tükendi</>}
                </span>
              </div>

              {product.specifications.length > 0 && (
                <div className={styles.specsSection}>
                  <h4>Özellikler</h4>
                  <div className={styles.specsList}>
                    {product.specifications.map((spec, idx) => (
                      <div key={idx} className={styles.specItem}>
                        <span className={styles.specKey}>{spec.key}</span>
                        <span className={styles.specValue}>{spec.value} {spec.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.metaSection}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Kaynak</span>
                  <span className={styles.metaValue}>{product.source || 'Bilinmiyor'}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Güncelleme</span>
                  <span className={styles.metaValue}>
                    <Calendar size={11} />
                    {new Date(product.lastUpdated).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  className={`${styles.favBtn} ${product.isFavorite ? styles.favBtnActive : ''}`}
                  onClick={() => {
                    toggleFavorite(product.id);
                    addNotification({
                      type: product.isFavorite ? 'info' : 'success',
                      title: product.isFavorite ? 'Favoriden Çıkarıldı' : 'Favorilere Eklendi',
                      message: `${product.name} ${product.isFavorite ? 'favorilerden çıkarıldı' : 'favorilere eklendi'}.`,
                    });
                  }}
                >
                  {product.isFavorite ? '★ Favori' : '☆ Favori'}
                </button>
                {product.url && (
                  <a href={product.url} target="_blank" rel="noopener noreferrer" className={styles.visitLink}>
                    Siteye Git <ArrowUpRight size={13} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- Spec Comparison Table ---- */}
      {items.length > 1 && allSpecKeys.length > 0 && (
        <div className={styles.specComparison}>
          <h3 className={styles.sectionTitle}>Özellik Karşılaştırması</h3>
          <div className={styles.specTableWrap}>
            <table className={styles.specTable}>
              <thead>
                <tr>
                  <th>Özellik</th>
                  {items.map(({ product }) => (
                    <th key={product.id}>{product.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allSpecKeys.map(key => (
                  <tr key={key}>
                    <td className={styles.specKeyCell}>{key}</td>
                    {items.map(({ product }) => {
                      const spec = product.specifications.find(s => s.key === key);
                      return (
                        <td key={product.id}>
                          {spec ? `${spec.value} ${spec.unit || ''}`.trim() : (
                            <span className={styles.notAvailable}>—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;
