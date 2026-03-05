import type { Product, ScrapedDataCache } from '../types';

const CACHE_KEY = 'endustriyel-scraped-data';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export class CacheService {
  private static instance: CacheService;
  private memoryCache: ScrapedDataCache | null = null;

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Save scraped data to cache (localStorage + memory)
   */
  saveCache(products: Product[], source: string): void {
    const cache: ScrapedDataCache = {
      products: products.map(p => ({ ...p, isCached: true })),
      scrapedAt: new Date(),
      source,
      status: 'fresh',
    };

    this.memoryCache = cache;

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  /**
   * Load cached data
   */
  loadCache(): ScrapedDataCache | null {
    // Check memory first
    if (this.memoryCache) {
      return this.memoryCache;
    }

    // Try localStorage
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const cache: ScrapedDataCache = JSON.parse(stored);
        cache.scrapedAt = new Date(cache.scrapedAt);
        
        // Convert product dates
        cache.products = cache.products.map(p => ({
          ...p,
          lastUpdated: new Date(p.lastUpdated),
          scrapedAt: p.scrapedAt ? new Date(p.scrapedAt) : new Date(),
          isCached: true,
        }));

        this.memoryCache = cache;
        return cache;
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
    }

    return null;
  }

  /**
   * Get cached products with staleness check
   */
  getCachedProducts(): { products: Product[]; isStale: boolean; age: number } | null {
    const cache = this.loadCache();
    if (!cache) return null;

    const now = Date.now();
    const scrapedTime = new Date(cache.scrapedAt).getTime();
    const age = now - scrapedTime;
    const isStale = age > CACHE_DURATION;

    return {
      products: cache.products,
      isStale,
      age,
    };
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.memoryCache = null;
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  /**
   * Get cache age in human readable format (Turkish)
   */
  getCacheAgeString(timestamp: Date): string {
    const age = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(age / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} gün önce`;
    if (hours > 0) return `${hours} saat önce`;
    const minutes = Math.floor(age / (1000 * 60));
    if (minutes > 0) return `${minutes} dakika önce`;
    return 'az önce';
  }

  /**
   * Check if cache is valid (exists and not too old)
   */
  isCacheValid(maxAge: number = CACHE_DURATION): boolean {
    const cache = this.loadCache();
    if (!cache) return false;

    const age = Date.now() - new Date(cache.scrapedAt).getTime();
    return age < maxAge;
  }
}

export const cacheService = CacheService.getInstance();
