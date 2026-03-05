import React, { useState, useEffect } from 'react';
import styles from './ScraperTestPanel.module.css';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { scraperConfigs } from '../../scrapers/scraperConfigs';
import type { ScrapingResult } from '../../types';

export const ScraperTestPanel: React.FC = () => {
  const [results, setResults] = useState<Record<string, ScrapingResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if running in Electron
    setIsElectron(!!window.electronAPI?.scraper);
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 50));
  };

  const runScraper = async (scraperId: string) => {
    if (!window.electronAPI?.scraper) {
      addLog('❌ Electron API not available. Run in Electron main process.');
      return;
    }

    setLoading(prev => ({ ...prev, [scraperId]: true }));
    addLog(`🚀 Starting scraper: ${scraperId}`);

    try {
      const response = await window.electronAPI.scraper.run(scraperId);
      
      if (response.success) {
        setResults(prev => ({ ...prev, [scraperId]: response.data }));
        addLog(`✅ ${scraperId} completed: ${response.data.products?.length || 0} products`);
      } else {
        addLog(`❌ ${scraperId} failed: ${response.error}`);
      }
    } catch (error) {
      addLog(`❌ ${scraperId} error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(prev => ({ ...prev, [scraperId]: false }));
    }
  };

  const runAllScrapers = async () => {
    if (!window.electronAPI?.scraper) {
      addLog('❌ Electron API not available');
      return;
    }

    addLog('🚀 Starting all scrapers...');
    setLoading(prev => ({
      ...prev,
      ...scraperConfigs.reduce((acc, c) => ({ ...acc, [c.id]: true }), {})
    }));

    try {
      const response = await window.electronAPI.scraper.runAll();
      
      if (response.success) {
        const newResults: Record<string, ScrapingResult> = {};
        response.data.forEach((result: any) => {
          newResults[result.scraperId || result.source] = result;
        });
        setResults(newResults);
        
        const totalProducts = response.data.reduce((sum: number, r: any) => sum + (r.products?.length || 0), 0);
        addLog(`✅ All scrapers completed: ${totalProducts} total products`);
      } else {
        addLog(`❌ Scraping failed: ${response.error}`);
      }
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(prev => ({
        ...prev,
        ...scraperConfigs.reduce((acc, c) => ({ ...acc, [c.id]: false }), {})
      }));
    }
  };

  const clearLogs = () => setLogs([]);

  if (!isElectron) {
    return (
      <Card variant="default" className={styles.warning}>
        <h3>⚠️ Electron Gerekli</h3>
        <p>Gerçek site testi için uygulamayı Electron ile çalıştırın:</p>
        <code>npm run electron:dev</code>
      </Card>
    );
  }

  return (
    <div className={styles.container}>
      <Card variant="elevated" className={styles.header}>
        <h2 className={styles.title}>Scraper Test Paneli</h2>
        <p className={styles.subtitle}>Gerçek sitelerden veri çekme testi</p>
      </Card>

      <div className={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          onClick={runAllScrapers}
          isLoading={Object.values(loading).some(Boolean)}
          disabled={Object.values(loading).some(Boolean)}
        >
          Tümünü Çalıştır
        </Button>
        <Button variant="ghost" size="lg" onClick={clearLogs}>
          Logları Temizle
        </Button>
      </div>

      <div className={styles.grid}>
        {scraperConfigs.map(config => (
          <Card key={config.id} variant="default" className={styles.scraperCard}>
            <div className={styles.scraperHeader}>
              <h3 className={styles.scraperName}>{config.name}</h3>
              <span className={styles.scraperUrl}>{config.baseUrl}</span>
            </div>
            
            <div className={styles.scraperInfo}>
              <p>Kategori: {config.category}</p>
              <p>Schedule: {config.schedule}</p>
            </div>

            {results[config.id] && (
              <div className={styles.result}>
                {results[config.id].success ? (
                  <>
                    <span className={styles.success}>✅ Başarılı</span>
                    <span>{results[config.id].products?.length || 0} ürün</span>
                    <span>{results[config.id].duration}ms</span>
                  </>
                ) : (
                  <span className={styles.error}>❌ Hata: {results[config.id].error}</span>
                )}
              </div>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => runScraper(config.id)}
              isLoading={loading[config.id]}
              disabled={loading[config.id]}
              fullWidth
            >
              {loading[config.id] ? 'Çalışıyor...' : 'Çalıştır'}
            </Button>
          </Card>
        ))}
      </div>

      <Card variant="default" className={styles.logsCard}>
        <h3 className={styles.logsTitle}>Loglar</h3>
        <div className={styles.logs}>
          {logs.length === 0 ? (
            <p className={styles.empty}>Henüz log yok...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className={styles.logLine}>{log}</div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default ScraperTestPanel;
