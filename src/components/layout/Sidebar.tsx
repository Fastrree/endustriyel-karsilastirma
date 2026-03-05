import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import styles from './Sidebar.module.css';
import { useFilterStore } from '../../store';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { filters, toggleCategory, toggleSupplier, setPriceRange, resetFilters } = useFilterStore();

  const categories = ['İplik', 'Kumaş', 'Dokuma', 'Örme', 'Teknik Tekstil'];
  const suppliers = [
    { id: '1', name: 'Korteks' },
    { id: '2', name: 'SANKO' },
    { id: '3', name: 'Bossa' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />

      {/* Floating Filter Panel */}
      <aside className={styles.filterPanel} role="dialog" aria-label="Filtreler">
        <div className={styles.panelHeader}>
          <div className={styles.panelTitleWrap}>
            <SlidersHorizontal size={18} className={styles.panelIcon} />
            <h2 className={styles.panelTitle}>Filtreler</h2>
          </div>
          <div className={styles.panelActions}>
            <button className={styles.resetButton} onClick={resetFilters}>
              Temizle
            </button>
            <button className={styles.closeButton} onClick={onClose} aria-label="Kapat">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className={styles.panelBody}>
          {/* Categories */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Kategoriler</h3>
            <div className={styles.chipGroup}>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`${styles.chip} ${filters.categories.includes(category) ? styles.chipActive : ''}`}
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Suppliers */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Tedarikçiler</h3>
            <div className={styles.chipGroup}>
              {suppliers.map((supplier) => (
                <button
                  key={supplier.id}
                  className={`${styles.chip} ${filters.suppliers.includes(supplier.id) ? styles.chipActive : ''}`}
                  onClick={() => toggleSupplier(supplier.id)}
                >
                  {supplier.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Fiyat Aralığı</h3>
            <div className={styles.priceRange}>
              <input
                type="number"
                placeholder="Min ₺"
                value={filters.priceRange.min || ''}
                onChange={(e) => setPriceRange(
                  e.target.value ? Number(e.target.value) : null,
                  filters.priceRange.max
                )}
                className={styles.priceInput}
              />
              <span className={styles.priceSep}>—</span>
              <input
                type="number"
                placeholder="Max ₺"
                value={filters.priceRange.max || ''}
                onChange={(e) => setPriceRange(
                  filters.priceRange.min,
                  e.target.value ? Number(e.target.value) : null
                )}
                className={styles.priceInput}
              />
            </div>
          </div>
        </div>

        <div className={styles.panelFooter}>
          <button className={styles.applyButton} onClick={onClose}>
            Sonuçları Göster
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
