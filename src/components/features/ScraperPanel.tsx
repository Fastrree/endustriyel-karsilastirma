import React, { useState, useCallback } from 'react';
import styles from './ScraperPanel.module.css';
import { useScrapingStore, useProductStore, useNotificationStore } from '../../store';
import { scraperManager } from '../../services/scraperManager';
import { scraperConfigs } from '../../scrapers/scraperConfigs';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { CacheStatus } from '../ui/CacheStatus';

export const ScraperPanel: React.FC = () => {
  const [selectedScraper, setSelectedScraper] = useState<string | null>(null);

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
        // Try to load from cache
        const cached = await useScrapingStore.getState().loadFromCache();
        if (cached) {
          setUseCachedData(true);
          finishScraping(false, result.error);
          addNotification({
            type: 'warning',
            title: 'Güncelleme Başarısız',
            message: 'Güncel veri alınamadı, cache\'den yükleniyor.',
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
      addNotification({
        type: 'error',
        title: 'Hata',
        message: message,
      });
    } finally {
      setLoading(false);
    }
  }, [startScraping, updateProgress, finishScraping, setProducts, setLoading, addNotification, setUseCachedData]);

  const handleUseCache = useCallback(async () => {
    const loaded = await useScrapingStore.getState().loadFromCache();
    if (loaded) {
      addNotification({
        type: 'info',
        title: 'Cache Yüklendi',
        message: 'Önceki veriler cache\'den yüklendi.',
      });
    } else {
      addNotification({
        type: 'warning',
        title: 'Cache Boş',
        message: 'Önbellekte veri bulunamadı.',
      });
    }
  }, [addNotification]);

  return (
    <div className={styles.container}>
      <Card variant="elevated" className={styles.headerCard}>
        <h2 className={styles.title}>Veri Kaynakları</h2>
        <p className={styles.subtitle}>
          Ürün verilerini otomatik olarak çeşitli kaynaklardan çekin
        </p>
      </Card>

      <CacheStatus
        lastUpdateTime={lastScrapeTime}
        isStale={useCachedData}
        isLoading={isScraping}
        onRefresh={() => handleScrape()}
      />

      {isScraping && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${scrapingProgress}%` }}
            />
          </div>
          <p className={styles.progressMessage}>{scrapingMessage}</p>
        </div>
      )}

      <div className={styles.scrapersList}>
        <h3 className={styles.sectionTitle}>Aktif Kaynaklar</h3>
        {scraperConfigs.map((config) => (
          <Card
            key={config.id}
            variant="default"
            isHoverable
            className={`${styles.scraperCard} ${selectedScraper === config.id ? styles.selected : ''}`}
            onClick={() => setSelectedScraper(config.id)}
          >
            <div className={styles.scraperInfo}>
              <h4 className={styles.scraperName}>{config.name}</h4>
              <p className={styles.scraperUrl}>{config.baseUrl}</p>
              <span className={styles.scraperCategory}>{config.category}</span>
            </div>
            <div className={styles.scraperActions}>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleScrape(config.id);
                }}
                disabled={isScraping}
              >
                Güncelle
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          onClick={() => handleScrape()}
          isLoading={isScraping}
          disabled={isScraping}
          fullWidth
        >
          Tümünü Güncelle
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={handleUseCache}
          disabled={isScraping}
          fullWidth
        >
          Cache Kullan
        </Button>
      </div>
    </div>
  );
};

export default ScraperPanel;
