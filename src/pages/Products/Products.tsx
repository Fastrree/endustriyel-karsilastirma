import React, { useEffect, useState, useRef } from 'react';
import styles from './Products.module.css';
import { useProductStore, useFilterStore, useComparisonStore, useNotificationStore } from '../../store';
import { ProductDetailModal } from '../../components/features/ProductDetailModal';
import { ExportService } from '../../services/exportService';
import type { FilterState, Product } from '../../types';
import { getMockProducts } from '../../services/mockDataService';
import {
  Download, Search as SearchIcon, AlertTriangle, SearchX,
  SlidersHorizontal, Package, ExternalLink,
  GitCompareArrows, Star, ChevronDown, ChevronsDown,
  FileSpreadsheet, FileText, Printer
} from 'lucide-react';

interface ProductsProps {
  onOpenFilters?: () => void;
}

export const Products: React.FC<ProductsProps> = ({ onOpenFilters }) => {
  const { products, setProducts, isLoading, error } = useProductStore();
  const { addNotification } = useNotificationStore();
  const { filters, setSearchQuery, setSortBy } = useFilterStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const INITIAL_COUNT = 6;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    if (exportOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [exportOpen]);

  useEffect(() => {
    if (products.length === 0) {
      const mockData = getMockProducts();
      setProducts(mockData);
    }
  }, [products.length, setProducts]);

  const filteredProducts = useFilterStore.getState().applyFilters(products);
  const visibleProducts = showAll ? filteredProducts : filteredProducts.slice(0, INITIAL_COUNT);
  const hasMore = filteredProducts.length > INITIAL_COUNT && !showAll;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Package size={20} />
          </div>
          <div>
            <h1 className={styles.title}>Ürünler</h1>
            <p className={styles.subtitle}>
              <span className={styles.count}>{filteredProducts.length}</span> ürün listeleniyor
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.actionBtn} onClick={onOpenFilters}>
            <SlidersHorizontal size={15} />
            <span>Filtrele</span>
          </button>
          <div className={styles.exportWrap} ref={exportRef}>
            <button
              className={`${styles.actionBtn} ${styles.exportBtn}`}
              onClick={() => setExportOpen(!exportOpen)}
            >
              <Download size={15} />
              <span>İndir</span>
              <ChevronDown size={12} className={exportOpen ? styles.chevronUp : ''} />
            </button>

            {exportOpen && (
              <div className={styles.exportDropdown}>
                <button
                  className={styles.exportItem}
                  onClick={async () => { await ExportService.exportToExcel(filteredProducts, 'products'); setExportOpen(false); addNotification({ type: 'success', title: 'Excel İndirildi', message: 'Ürün raporu başarıyla oluşturuldu.' }); }}
                >
                  <FileSpreadsheet size={16} className={styles.exportItemIconGreen} />
                  <div className={styles.exportItemText}>
                    <span className={styles.exportItemTitle}>Excel Raporu</span>
                    <span className={styles.exportItemDesc}>Dashboard + detay + fiyat analizi</span>
                  </div>
                </button>
                <button
                  className={styles.exportItem}
                  onClick={() => { ExportService.exportToCSV(filteredProducts); setExportOpen(false); addNotification({ type: 'success', title: 'CSV İndirildi', message: 'Veriler CSV formatında indirildi.' }); }}
                >
                  <FileText size={16} className={styles.exportItemIconBlue} />
                  <div className={styles.exportItemText}>
                    <span className={styles.exportItemTitle}>CSV</span>
                    <span className={styles.exportItemDesc}>Ham veri — tablo programları için</span>
                  </div>
                </button>
                <button
                  className={styles.exportItem}
                  onClick={() => { ExportService.exportToPDF(filteredProducts); setExportOpen(false); addNotification({ type: 'success', title: 'PDF Raporu', message: 'Rapor yeni sekmede açıldı.' }); }}
                >
                  <Printer size={16} className={styles.exportItemIconPurple} />
                  <div className={styles.exportItemText}>
                    <span className={styles.exportItemTitle}>PDF Rapor</span>
                    <span className={styles.exportItemDesc}>Görsel dashboard — yazdırılabilir</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search + Sort Bar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <SearchIcon size={15} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Ürün, tedarikçi ara..."
            value={filters.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.sortWrap}>
          <ChevronDown size={14} className={styles.sortChevron} />
          <select
            value={filters.sortBy}
            onChange={(e) => setSortBy(e.target.value as FilterState['sortBy'])}
            className={styles.sortSelect}
          >
            <option value="date_desc">En Yeni</option>
            <option value="price_asc">Fiyat ↑</option>
            <option value="price_desc">Fiyat ↓</option>
            <option value="name_asc">A → Z</option>
            <option value="name_desc">Z → A</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : error ? (
        <div className={styles.statePanel}>
          <AlertTriangle size={28} />
          <h3>Bir hata oluştu</h3>
          <p>{error}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className={styles.statePanel}>
          <SearchX size={28} />
          <h3>Ürün bulunamadı</h3>
          <p>Arama kriterlerinize uygun ürün bulunamadı.</p>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
          {hasMore && (
            <button className={styles.showMoreBtn} onClick={() => setShowAll(true)}>
              <ChevronsDown size={16} />
              <span>Tümünü Göster ({filteredProducts.length - INITIAL_COUNT} ürün daha)</span>
            </button>
          )}
          {showAll && filteredProducts.length > INITIAL_COUNT && (
            <button className={`${styles.showMoreBtn} ${styles.showLessBtn}`} onClick={() => setShowAll(false)}>
              <ChevronsDown size={16} style={{ transform: 'rotate(180deg)' }} />
              <span>Daha Az Göster</span>
            </button>
          )}
        </>
      )}

      {selectedProduct && (
        <ProductDetailModal
          isOpen={true}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

/* ---- Product Card Component ---- */
interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { toggleFavorite } = useProductStore();
  const { addToComparison, isInComparison, canAddMore } = useComparisonStore();
  const { addNotification: notify } = useNotificationStore();
  const inComparison = isInComparison(product.id);

  return (
    <div className={styles.card} onClick={onClick}>
      {/* Card Top */}
      <div className={styles.cardTop}>
        <span className={styles.cardCategory}>{product.category}</span>
        <button
          className={`${styles.favBtn} ${product.isFavorite ? styles.favActive : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); notify({ type: product.isFavorite ? 'info' : 'success', title: product.isFavorite ? 'Favoriden Çıkarıldı' : 'Favorilere Eklendi', message: `${product.name}` }); }}
          title={product.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
        >
          {product.isFavorite ? <Star size={14} fill="currentColor" /> : <Star size={14} />}
        </button>
      </div>

      {/* Card Body */}
      <h3 className={styles.cardName}>{product.name}</h3>

      {product.description && (
        <p className={styles.cardDesc}>{product.description}</p>
      )}

      {/* Specs Chips */}
      {product.specifications.length > 0 && (
        <div className={styles.cardSpecs}>
          {product.specifications.slice(0, 3).map((spec) => (
            <span key={spec.key} className={styles.specChip}>
              {spec.key}: {spec.value}{spec.unit || ''}
            </span>
          ))}
        </div>
      )}

      {/* Price */}
      <div className={styles.cardPrice}>
        <span className={styles.priceAmount}>
          {product.price.toLocaleString('tr-TR')}
        </span>
        <span className={styles.priceCurrency}>{product.currency}</span>
        <span className={styles.priceUnit}>/ {product.unit}</span>
      </div>

      {/* Footer */}
      <div className={styles.cardFooter}>
        <div className={styles.cardSupplier}>
          <span className={styles.supplierDot} />
          {product.supplier.name}
        </div>
        <span className={`${styles.stockBadge} ${styles[product.stockStatus]}`}>
          {product.stockStatus === 'in_stock' && 'Stokta'}
          {product.stockStatus === 'low_stock' && 'Az Stok'}
          {product.stockStatus === 'out_of_stock' && 'Tükendi'}
        </span>
      </div>

      {/* Card Actions */}
      <div className={styles.cardActions}>
        {product.url && (
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.cardAction}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={13} />
            <span>Siteye Git</span>
          </a>
        )}
        <button
          className={`${styles.cardAction} ${styles.compareAction} ${inComparison ? styles.compared : ''}`}
          disabled={inComparison || !canAddMore()}
          onClick={(e) => { e.stopPropagation(); addToComparison(product); notify({ type: 'success', title: 'Karşılaştırmaya Eklendi', message: `${product.name} karşılaştırma listesine eklendi.` }); }}
        >
          <GitCompareArrows size={13} />
          <span>{inComparison ? 'Eklendi' : 'Karşılaştır'}</span>
        </button>
      </div>
    </div>
  );
};

export default Products;
