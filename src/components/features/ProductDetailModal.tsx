import React, { useState } from 'react';
import styles from './ProductDetailModal.module.css';
import type { Product } from '../../types';
import { useComparisonStore } from '../../store';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { X, GitCompareArrows } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const generatePriceHistory = (basePrice: number) => {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const fluctuation = (Math.random() - 0.5) * 0.1;
    const price = basePrice * (1 + fluctuation);
    data.push({
      date: date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      fullDate: date.toISOString().split('T')[0],
      price: Number(price.toFixed(2)),
    });
  }
  return data;
};

const generateCompetitorPrices = (basePrice: number) => [
  { site: 'Kumaşçı', price: basePrice, currency: 'TRY', url: '#' },
  { site: 'Kumaş Fırsatı', price: basePrice * 0.95, currency: 'TRY', url: '#' },
  { site: 'Alibaba', price: basePrice * 0.85, currency: 'USD', url: '#' },
  { site: 'Fibre2Fashion', price: basePrice * 1.1, currency: 'EUR', url: '#' },
];

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [activeTab, setActiveTab] = useState<'overview' | 'prices' | 'history'>('overview');
  const { addToComparison, isInComparison, canAddMore } = useComparisonStore();

  if (!isOpen) return null;

  const priceHistory = generatePriceHistory(product.price);
  const competitorPrices = generateCompetitorPrices(product.price);
  const lowestPrice = competitorPrices.reduce((min, p) => p.price < min.price ? p : min, competitorPrices[0]);
  const priceChange = priceHistory[priceHistory.length - 1].price - priceHistory[0].price;
  const priceChangePercent = (priceChange / priceHistory[0].price) * 100;
  const inComparison = isInComparison(product.id);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{product.name}</h2>
            <p className={styles.subtitle}>{product.category} • {product.supplier.name}</p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Genel Bakış
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'prices' ? styles.active : ''}`}
            onClick={() => setActiveTab('prices')}
          >
            Fiyat Karşılaştırma
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Fiyat Geçmişi
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {activeTab === 'overview' && (
            <div className={styles.overview}>
              <div className={styles.priceSection}>
                <div className={styles.currentPrice}>
                  <span className={styles.priceAmount}>
                    {product.price.toLocaleString('tr-TR')}
                  </span>
                  <span className={styles.priceCurrency}>{product.currency}</span>
                  <span className={styles.priceUnit}>/ {product.unit}</span>
                </div>
                <div className={`${styles.priceChange} ${priceChange >= 0 ? styles.positive : styles.negative}`}>
                  {priceChange >= 0 ? '↑' : '↓'} {Math.abs(priceChangePercent).toFixed(2)}%
                  <span className={styles.changeLabel}> (30 gün)</span>
                </div>
              </div>

              <div className={styles.specsGrid}>
                <div className={styles.specCard}>
                  <h4>Tedarikçi</h4>
                  <p>{product.supplier.name}</p>
                  {product.supplier.rating && (
                    <span className={styles.rating}>⭐ {product.supplier.rating}/5</span>
                  )}
                </div>

                <div className={styles.specCard}>
                  <h4>Stok Durumu</h4>
                  <span className={`${styles.stock} ${styles[product.stockStatus]}`}>
                    {product.stockStatus === 'in_stock' && '✓ Stokta'}
                    {product.stockStatus === 'low_stock' && '⚠ Az Stok'}
                    {product.stockStatus === 'out_of_stock' && '✗ Tükendi'}
                  </span>
                </div>

                <div className={styles.specCard}>
                  <h4>Kaynak</h4>
                  <p>{product.source || 'Bilinmiyor'}</p>
                  <span className={styles.date}>
                    {new Date(product.lastUpdated).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>

              {product.specifications.length > 0 && (
                <div className={styles.specifications}>
                  <h3>Ürün Özellikleri</h3>
                  <div className={styles.specsList}>
                    {product.specifications.map((spec, idx) => (
                      <div key={idx} className={styles.specItem}>
                        <span className={styles.specKey}>{spec.key}</span>
                        <span className={styles.specValue}>
                          {spec.value} {spec.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prices' && (
            <div className={styles.pricesTab}>
              <h3>Site Fiyat Karşılaştırması</h3>
              <div className={styles.priceList}>
                {competitorPrices.map((item, idx) => (
                  <div
                    key={idx}
                    className={`${styles.priceItem} ${item.price === lowestPrice.price ? styles.best : ''}`}
                  >
                    <div className={styles.siteName}>{item.site}</div>
                    <div className={styles.sitePrice}>
                      {item.price.toLocaleString('tr-TR')} {item.currency}
                    </div>
                    {item.price === lowestPrice.price && (
                      <span className={styles.bestBadge}>En İyi Fiyat</span>
                    )}
                    <a href={item.url} className={styles.visitLink} target="_blank" rel="noopener noreferrer">
                      Siteye Git →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className={styles.historyTab}>
              <div className={styles.timeRangeButtons}>
                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((range) => (
                  <button
                    key={range}
                    className={`${styles.rangeButton} ${timeRange === range ? styles.active : ''}`}
                    onClick={() => setTimeRange(range)}
                  >
                    {range === 'daily' && 'Günlük'}
                    {range === 'weekly' && 'Haftalık'}
                    {range === 'monthly' && 'Aylık'}
                    {range === 'yearly' && 'Yıllık'}
                  </button>
                ))}
              </div>

              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={priceHistory}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0066FF" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.1)"
                      tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.1)"
                      tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(12, 12, 18, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        backdropFilter: 'blur(12px)',
                      }}
                      labelStyle={{ color: 'rgba(255,255,255,0.4)' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#0066FF"
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>En Düşük</span>
                  <span className={styles.statValue}>
                    {Math.min(...priceHistory.map(d => d.price)).toFixed(2)} {product.currency}
                  </span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>En Yüksek</span>
                  <span className={styles.statValue}>
                    {Math.max(...priceHistory.map(d => d.price)).toFixed(2)} {product.currency}
                  </span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Ortalama</span>
                  <span className={styles.statValue}>
                    {(priceHistory.reduce((sum, d) => sum + d.price, 0) / priceHistory.length).toFixed(2)} {product.currency}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            className={styles.closeButton}
            onClick={onClose}
            style={{ fontSize: '13px', width: 'auto', padding: '0 16px', height: '38px', gap: '6px' }}
          >
            Kapat
          </button>
          <button
            className={styles.closeButton}
            onClick={() => { if (!inComparison && canAddMore()) addToComparison(product); }}
            disabled={inComparison || !canAddMore()}
            style={{
              fontSize: '13px',
              width: 'auto',
              padding: '0 16px',
              height: '38px',
              gap: '6px',
              background: inComparison ? 'rgba(0, 204, 102, 0.1)' : 'rgba(0, 102, 255, 0.12)',
              borderColor: inComparison ? 'rgba(0, 204, 102, 0.2)' : 'rgba(0, 102, 255, 0.2)',
              color: inComparison ? 'var(--accent-secondary)' : 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <GitCompareArrows size={14} />
            {inComparison ? 'Eklendi' : 'Karşılaştırmaya Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
