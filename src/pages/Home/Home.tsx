import React, { useMemo } from 'react';
import {
  Search, GitCompareArrows, ArrowRight, Package, Factory,
  BarChart3, RefreshCw, Zap, TrendingUp, Clock, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProductStore, useComparisonStore } from '../../store';
import { getMockProducts } from '../../services/mockDataService';
import styles from './Home.module.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useProductStore();
  const comparison = useComparisonStore((state) => state.comparison);

  // Ensure products are loaded
  const allProducts = products.length > 0 ? products : getMockProducts();

  // Derived stats from actual data
  const stats = useMemo(() => {
    const uniqueSuppliers = new Set(allProducts.map(p => p.supplier.id));
    const lastUpdated = allProducts.reduce((latest, p) => {
      const d = new Date(p.lastUpdated);
      return d > latest ? d : latest;
    }, new Date(0));

    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    let lastUpdateText = 'N/A';
    if (diffMins < 1) lastUpdateText = 'Az önce';
    else if (diffMins < 60) lastUpdateText = `${diffMins}dk`;
    else if (diffMins < 1440) lastUpdateText = `${Math.floor(diffMins / 60)}s`;
    else lastUpdateText = `${Math.floor(diffMins / 1440)}g`;

    return {
      totalProducts: allProducts.length,
      totalSuppliers: uniqueSuppliers.size,
      totalComparisons: comparison.items.length,
      lastUpdate: lastUpdateText,
    };
  }, [allProducts, comparison]);

  // Derive trends from actual product data
  const trends = useMemo(() => {
    if (allProducts.length < 2) return [];
    const sorted = [...allProducts].sort((a, b) => b.price - a.price);
    return sorted.map((p) => ({
      name: p.name,
      price: p.price,
      currency: p.currency,
      isUp: p.price >= sorted[0].price / 2,
    }));
  }, [allProducts]);

  // Derive recent activity from products
  const recentActivity = useMemo(() => {
    const activities: { text: string; time: string; color: string }[] = [];

    const sortedByDate = [...allProducts]
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

    sortedByDate.forEach((p, i) => {
      const colors = ['green', 'blue', 'purple', 'orange'];
      const d = new Date(p.lastUpdated);
      const now = new Date();
      const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000);
      let timeText = 'Az önce';
      if (diffMins >= 1 && diffMins < 60) timeText = `${diffMins} dakika önce`;
      else if (diffMins >= 60 && diffMins < 1440) timeText = `${Math.floor(diffMins / 60)} saat önce`;
      else if (diffMins >= 1440) timeText = `${Math.floor(diffMins / 1440)} gün önce`;

      activities.push({
        text: `<strong>${p.name}</strong> — ${p.supplier.name}`,
        time: timeText,
        color: colors[i % colors.length],
      });
    });

    return activities;
  }, [allProducts]);

  // Favorites
  const favorites = useMemo(() => {
    return allProducts.filter(p => p.isFavorite);
  }, [allProducts]);

  return (
    <div className={styles.container}>
      {/* Background mesh */}
      <div className={styles.meshBg}>
        <div className={styles.meshOrb1} />
        <div className={styles.meshOrb2} />
      </div>

      {/* Bento Grid */}
      <div className={styles.bento}>

        {/* ---- Row 1: Welcome + Stats ---- */}

        {/* Welcome Panel */}
        <div className={`${styles.panel} ${styles.welcome}`} onClick={() => navigate('/products')}>
          <div className={styles.welcomeContent}>
            <div className={styles.welcomeBadge}>
              <Zap size={14} />
              <span>Endüstriyel Zeka Merkezi</span>
            </div>
            <h1 className={styles.welcomeTitle}>
              Akıllı<br />
              <span className={styles.welcomeHighlight}>Karşılaştırma</span>
            </h1>
            <p className={styles.welcomeDesc}>
              Tedarik zincirinizi optimize edin
            </p>
            <div className={styles.welcomeCta}>
              <span>Keşfet</span>
              <ArrowRight size={16} />
            </div>
          </div>
          <div className={styles.welcomeGlow} />
        </div>

        {/* Stat: Toplam Ürün */}
        <div className={`${styles.panel} ${styles.stat}`} onClick={() => navigate('/products')} style={{ cursor: 'pointer' }}>
          <div className={`${styles.statIcon} ${styles.blue}`}>
            <Package size={22} />
          </div>
          <div className={styles.statValue}>{stats.totalProducts.toLocaleString('tr-TR')}</div>
          <div className={styles.statLabel}>TOPLAM ÜRÜN</div>
        </div>

        {/* Stat: Tedarikçi */}
        <div className={`${styles.panel} ${styles.stat}`}>
          <div className={`${styles.statIcon} ${styles.green}`}>
            <Factory size={22} />
          </div>
          <div className={styles.statValue}>{stats.totalSuppliers}</div>
          <div className={styles.statLabel}>TEDARİKÇİ</div>
        </div>

        {/* ---- Row 2: Quick Actions + More Stats ---- */}

        <div className={`${styles.panel} ${styles.action}`} onClick={() => navigate('/products')}>
          <div className={`${styles.actionIcon} ${styles.blue}`}>
            <Search size={24} />
          </div>
          <span className={styles.actionLabel}>Ürün Ara</span>
          <ArrowRight size={14} className={styles.actionArrow} />
        </div>

        <div className={`${styles.panel} ${styles.action}`} onClick={() => navigate('/compare')}>
          <div className={`${styles.actionIcon} ${styles.purple}`}>
            <GitCompareArrows size={24} />
          </div>
          <span className={styles.actionLabel}>Karşılaştır</span>
          <ArrowRight size={14} className={styles.actionArrow} />
        </div>

        {/* Stat: Karşılaştırma */}
        <div className={`${styles.panel} ${styles.stat}`} onClick={() => navigate('/compare')} style={{ cursor: 'pointer' }}>
          <div className={`${styles.statIcon} ${styles.purple}`}>
            <BarChart3 size={22} />
          </div>
          <div className={styles.statValue}>{stats.totalComparisons}</div>
          <div className={styles.statLabel}>KARŞILAŞTIRMA</div>
        </div>

        {/* Stat: Güncelleme */}
        <div className={`${styles.panel} ${styles.stat}`}>
          <div className={`${styles.statIcon} ${styles.orange}`}>
            <RefreshCw size={22} />
          </div>
          <div className={styles.statValue}>{stats.lastUpdate}</div>
          <div className={styles.statLabel}>SON GÜNCELLEME</div>
        </div>

        {/* ---- Row 3: Activity Feed — Full Width ---- */}

        <div className={`${styles.panel} ${styles.activity}`}>
          <div className={styles.activityHeader}>
            <Clock size={16} />
            <span>Son Aktiviteler</span>
          </div>
          <div className={styles.timeline}>
            {recentActivity.map((item, i) => (
              <div key={i} className={styles.timelineItem}>
                <div className={`${styles.timelineDot} ${styles[item.color]}`} />
                <div className={styles.timelineContent}>
                  <span
                    className={styles.timelineText}
                    dangerouslySetInnerHTML={{ __html: item.text }}
                  />
                  <span className={styles.timelineTime}>{item.time}</span>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className={styles.timelineEmpty}>Henüz aktivite yok</div>
            )}
          </div>
        </div>

        {/* ---- Row 4: Trending + Favorites ---- */}

        <div className={`${styles.panel} ${styles.trendPanel}`}>
          <div className={styles.trendHeader}>
            <TrendingUp size={16} />
            <span>En Pahalı Ürünler</span>
          </div>
          <div className={styles.trendContent}>
            {trends.map((t, i) => (
              <div key={i} className={styles.trendItem}>
                <span className={styles.trendName}>{t.name}</span>
                <span className={styles.trendChange}>
                  {t.price.toLocaleString('tr-TR')} {t.currency}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.panel} ${styles.favPanel}`}>
          <div className={styles.favHeader}>
            <Star size={16} />
            <span>Favoriler</span>
          </div>
          {favorites.length === 0 ? (
            <div className={styles.favEmpty}>
              <span>Henüz favori yok</span>
              <button className={styles.favButton} onClick={() => navigate('/products')}>
                Ürün Keşfet
              </button>
            </div>
          ) : (
            <div className={styles.favList}>
              {favorites.map((p) => (
                <div
                  key={p.id}
                  className={styles.favItem}
                  onClick={() => navigate('/products')}
                  style={{ cursor: 'pointer' }}
                >
                  <span className={styles.favName}>{p.name}</span>
                  <span className={styles.favPrice}>{p.price} {p.currency}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Home;
