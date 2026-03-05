import React, { useState, useCallback } from 'react';
import styles from './Scrapers.module.css';
import { useScrapingStore, useProductStore, useNotificationStore } from '../../store';
import { scraperManager } from '../../services/scraperManager';
import { scraperConfigs } from '../../scrapers/scraperConfigs';
import type { ScraperConfig } from '../../types';
import {
  Radio, RefreshCw, Globe, Clock, Layers, ChevronRight,
  Play, Loader2, CheckCircle2, AlertCircle, ExternalLink,
  Calendar, Tag, Info, Wifi, HardDrive, Timer
} from 'lucide-react';

const scheduleLabels: Record<string, string> = {
  manual: 'Manuel',
  hourly: 'Saatlik',
  daily: 'Günlük',
  weekly: 'Haftalık',
};

export const Scrapers: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    isScraping,
    scrapingProgress,
    scrapingMessage,
    lastScrapeTime,
    useCachedData,
    startScraping,
    updateProgress,
    finishScraping,
    setUseCachedData,
  } = useScrapingStore();

  const { setProducts, setLoading } = useProductStore();
  const { addNotification } = useNotificationStore();

  const selectedConfig = scraperConfigs.find(c => c.id === selectedId) || null;

  const handleScrape = useCallback(async (scraperId?: string) => {
    startScraping('Veriler güncelleniyor...');
    setLoading(true);

    const onProgress = (id: string, progress: number, message: string) => {
      updateProgress(progress, `[${id}] ${message}`);
    };

    try {
      let result;
      if (scraperId) {
        result = await scraperManager.runScraper(scraperId, onProgress);
      } else {
        const results = await scraperManager.runAllScrapers(onProgress);
        result = {
          success: results.every(r => r.success),
          products: results.flatMap(r => r.products),
          scrapedAt: new Date(),
          duration: results.reduce((sum, r) => sum + r.duration, 0),
        };
      }

      if (result.success) {
        setProducts(result.products);
        finishScraping(true);
        setUseCachedData(false);
        addNotification({
          type: 'success',
          title: 'Güncelleme Tamamlandı',
          message: `${result.products.length} ürün başarıyla güncellendi.`,
        });
      } else {
        const cached = await useScrapingStore.getState().loadFromCache();
        if (cached) {
          setUseCachedData(true);
          finishScraping(false, result.error);
          addNotification({
            type: 'warning',
            title: 'Güncelleme Başarısız',
            message: 'Güncel veri alınamadı, önceki kayıtlı veriler kullanılıyor.',
          });
        } else {
          finishScraping(false, result.error);
          addNotification({
            type: 'error',
            title: 'Hata',
            message: result.error || 'Bilinmeyen bir hata oluştu.',
          });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      finishScraping(false, message);
      addNotification({ type: 'error', title: 'Hata', message });
    } finally {
      setLoading(false);
    }
  }, [startScraping, updateProgress, finishScraping, setProducts, setLoading, addNotification, setUseCachedData]);

  const handleUseCache = useCallback(async () => {
    const loaded = await useScrapingStore.getState().loadFromCache();
    addNotification(loaded
      ? { type: 'success', title: 'Veriler Yüklendi', message: 'Önceki kayıtlı veriler başarıyla yüklendi.' }
      : { type: 'warning', title: 'Kayıtlı Veri Yok', message: 'Daha önce kaydedilmiş veri bulunamadı.' }
    );
  }, [addNotification]);

  const formatLastUpdate = () => {
    if (!lastScrapeTime) return 'Henüz güncellenmedi';
    const diff = Date.now() - new Date(lastScrapeTime).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Az önce';
    if (mins < 60) return `${mins} dk önce`;
    return `${Math.floor(mins / 60)} saat önce`;
  };

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Radio size={20} />
          </div>
          <div>
            <h1 className={styles.title}>Kaynaklar</h1>
            <p className={styles.subtitle}>Veri kaynaklarını yönetin ve güncelleyin</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.cacheBtn}
            onClick={handleUseCache}
            disabled={isScraping}
          >
            <Clock size={14} />
            <span>Önceki Verileri Yükle</span>
          </button>
          <button
            className={styles.refreshAllBtn}
            onClick={() => handleScrape()}
            disabled={isScraping}
          >
            {isScraping ? <Loader2 size={16} className={styles.spin} /> : <RefreshCw size={16} />}
            <span>{isScraping ? 'Güncelleniyor...' : 'Tümünü Güncelle'}</span>
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      {isScraping && (
        <div className={styles.progressWrap}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${scrapingProgress}%` }} />
          </div>
          <span className={styles.progressMsg}>{scrapingMessage}</span>
        </div>
      )}

      {/* Status Banner */}
      <div className={`${styles.statusBanner} ${useCachedData ? styles.stale : ''}`}>
        {useCachedData ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
        <span>{useCachedData ? 'Kaydedilmiş veriler kullanılıyor' : 'Veriler güncel'}</span>
        <span className={styles.statusTime}>• {formatLastUpdate()}</span>
      </div>

      {/* Master-Detail Layout */}
      <div className={styles.masterDetail}>
        {/* Source List */}
        <div className={styles.sourceList}>
          {scraperConfigs.map((config) => (
            <button
              key={config.id}
              className={`${styles.sourceCard} ${selectedId === config.id ? styles.sourceActive : ''}`}
              onClick={() => setSelectedId(selectedId === config.id ? null : config.id)}
            >
              <div className={styles.sourceIcon}>
                <Globe size={18} />
              </div>
              <div className={styles.sourceInfo}>
                <span className={styles.sourceName}>{config.name}</span>
                <span className={styles.sourceCategory}>{config.category}</span>
              </div>
              <div className={styles.sourceRight}>
                <span className={`${styles.sourceBadge} ${config.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                  {config.isActive ? 'Aktif' : 'Pasif'}
                </span>
                <ChevronRight size={14} className={styles.sourceChevron} />
              </div>
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        <div className={`${styles.detailPanel} ${selectedConfig ? styles.detailOpen : ''}`}>
          {selectedConfig ? (
            <SourceDetail
              config={selectedConfig}
              isScraping={isScraping}
              onScrape={() => handleScrape(selectedConfig.id)}
            />
          ) : (
            <div className={styles.detailEmpty}>
              <Layers size={32} />
              <span>Detayları görmek için bir kaynak seçin</span>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className={styles.infoSection}>
        <div className={styles.infoCard}>
          <div className={styles.infoIcon}><Info size={16} /></div>
          <h3 className={styles.infoTitle}>Nasıl Çalışır?</h3>
          <ul className={styles.infoList}>
            <li><Wifi size={12} /> Kaynaklardan veriler otomatik çekilir</li>
            <li><HardDrive size={12} /> Veriler cihazınıza kaydedilir</li>
            <li><Globe size={12} /> İnternet olmadan da çalışabilir</li>
            <li><Timer size={12} /> Kayıtlı veriler 24 saat geçerlidir</li>
          </ul>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoIcon}><Layers size={16} /></div>
          <h3 className={styles.infoTitle}>Desteklenen Kaynaklar</h3>
          <ul className={styles.infoList}>
            {scraperConfigs.map(c => (
              <li key={c.id}><Globe size={12} /> {c.name} — {c.category}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/* ---- Detail Sub-Component ---- */
interface SourceDetailProps {
  config: ScraperConfig;
  isScraping: boolean;
  onScrape: () => void;
}

const SourceDetail: React.FC<SourceDetailProps> = ({ config, isScraping, onScrape }) => (
  <div className={styles.detail}>
    {/* Detail Header */}
    <div className={styles.detailHeader}>
      <div className={styles.detailIconLarge}>
        <Globe size={24} />
      </div>
      <div>
        <h2 className={styles.detailTitle}>{config.name}</h2>
        <span className={styles.detailId}>#{config.id}</span>
      </div>
    </div>

    {/* Detail Info Grid */}
    <div className={styles.detailGrid}>
      <div className={styles.detailField}>
        <ExternalLink size={14} />
        <span className={styles.fieldLabel}>URL</span>
        <a
          href={config.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.fieldValue}
        >
          {config.baseUrl}
        </a>
      </div>

      <div className={styles.detailField}>
        <Tag size={14} />
        <span className={styles.fieldLabel}>Kategori</span>
        <span className={styles.fieldValue}>{config.category}</span>
      </div>

      <div className={styles.detailField}>
        <Calendar size={14} />
        <span className={styles.fieldLabel}>Güncelleme Sıklığı</span>
        <span className={styles.fieldValue}>{scheduleLabels[config.schedule] || config.schedule}</span>
      </div>

      <div className={styles.detailField}>
        <CheckCircle2 size={14} />
        <span className={styles.fieldLabel}>Durum</span>
        <span className={`${styles.fieldValue} ${config.isActive ? styles.fieldActive : styles.fieldInactive}`}>
          {config.isActive ? 'Aktif' : 'Pasif'}
        </span>
      </div>
    </div>

    {/* Action */}
    <button
      className={styles.detailAction}
      onClick={onScrape}
      disabled={isScraping}
    >
      {isScraping ? <Loader2 size={16} className={styles.spin} /> : <Play size={16} />}
      <span>{isScraping ? 'Güncelleniyor...' : 'Bu Kaynağı Güncelle'}</span>
    </button>
  </div>
);

export default Scrapers;
