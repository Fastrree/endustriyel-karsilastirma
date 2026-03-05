import type { ScrapingResult, Product } from '../types';
import { cacheService } from './cacheService.js';
import { scraperConfigs } from '../scrapers/scraperConfigs.js';

/**
 * ScraperManager - Handles scraper operations
 * 
 * IMPORTANT: This runs in Electron main process only.
 * For browser development, use mock data or IPC calls to main process.
 */

export class ScraperManager {
  private static instance: ScraperManager;
  private activeScrapers: Map<string, { abort: () => void }> = new Map();
  private isNodeEnvironment: boolean;

  constructor() {
    // Detect if we're in Node.js (Electron main process) or browser
    this.isNodeEnvironment = typeof window === 'undefined';
  }

  static getInstance(): ScraperManager {
    if (!ScraperManager.instance) {
      ScraperManager.instance = new ScraperManager();
    }
    return ScraperManager.instance;
  }

  /**
   * Check if running in Node.js environment
   */
  isRunningInNode(): boolean {
    return this.isNodeEnvironment;
  }

  /**
   * Run all active scrapers
   */
  async runAllScrapers(
    onProgress?: (scraperId: string, progress: number, message: string) => void
  ): Promise<ScrapingResult[]> {
    // Browser environment: return mock data or use IPC
    if (!this.isNodeEnvironment) {
      console.warn('Scrapers can only run in Electron main process');
      return this.getMockResults();
    }

    const activeConfigs = scraperConfigs.filter(c => c.isActive);
    const results: ScrapingResult[] = [];

    for (const config of activeConfigs) {
      const result = await this.runScraper(config.id, onProgress);
      results.push(result);
    }

    return results;
  }

  /**
   * Run a specific scraper
   */
  async runScraper(
    scraperId: string,
    onProgress?: (scraperId: string, progress: number, message: string) => void
  ): Promise<ScrapingResult> {
    const config = scraperConfigs.find(c => c.id === scraperId);
    if (!config) {
      return {
        success: false,
        products: [],
        scrapedAt: new Date(),
        duration: 0,
        error: `Scraper config not found: ${scraperId}`,
      };
    }

    // Browser environment: return mock data
    if (!this.isNodeEnvironment) {
      console.warn(`Scraper ${scraperId} can only run in Electron main process`);
      return this.getMockResult(scraperId);
    }

    onProgress?.(scraperId, 10, 'Başlatılıyor...');

    try {
      // Dynamic import to avoid browser bundling issues
      const { loadScraper } = await import('../scrapers/scraperLoader.js');
      
      const scraper = await loadScraper(config);
      
      onProgress?.(scraperId, 30, 'Sayfa yükleniyor...');
      const result = await scraper.scrape();

      if (result.success && result.products.length > 0) {
        onProgress?.(scraperId, 80, 'Cache\'e kaydediliyor...');
        cacheService.saveCache(result.products, config.baseUrl);
      }

      onProgress?.(scraperId, 100, result.success ? 'Tamamlandı' : 'Başarısız');
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      onProgress?.(scraperId, 100, `Hata: ${message}`);
      return {
        success: false,
        products: [],
        scrapedAt: new Date(),
        duration: 0,
        error: message,
      };
    }
  }

  /**
   * Stop a running scraper
   */
  stopScraper(scraperId: string): void {
    const scraper = this.activeScrapers.get(scraperId);
    if (scraper) {
      scraper.abort();
      this.activeScrapers.delete(scraperId);
    }
  }

  /**
   * Get cached data or run scrapers if cache is stale
   */
  async getProducts(useCache: boolean = true): Promise<Product[]> {
    // Try cache first
    if (useCache) {
      const cached = cacheService.getCachedProducts();
      if (cached && cached.products.length > 0) {
        console.log(`Using cached data (${cached.isStale ? 'stale' : 'fresh'})`);
        return cached.products;
      }
    }

    // Run scrapers (only works in main process)
    const results = await this.runAllScrapers();
    const allProducts = results.flatMap(r => r.products);
    
    return allProducts;
  }

  /**
   * Get mock results for browser development
   */
  private getMockResults(): ScrapingResult[] {
    return scraperConfigs
      .filter(c => c.isActive)
      .map(config => this.getMockResult(config.id));
  }

  /**
   * Get mock result for a specific scraper
   */
  private getMockResult(_scraperId: string): ScrapingResult {
    return {
      success: true,
      products: [],
      scrapedAt: new Date(),
      duration: 0,
      error: 'Mock mode - Scrapers only run in Electron main process',
    };
  }
}

export const scraperManager = ScraperManager.getInstance();
