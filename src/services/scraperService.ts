import puppeteer, { Browser } from 'puppeteer';
import type { Product, ScraperConfig, ScrapingResult, ScrapedDataCache, Supplier } from '../types';
import { cacheService } from './cacheService';

// =============================================
// CONFIGURATION CONSTANTS
// =============================================

const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 2000;
const DEFAULT_RATE_LIMIT_DELAY = 1000;
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// =============================================
// ERROR CLASSES
// =============================================

export class ScraperError extends Error {
  code: string;
  url?: string;
  originalError?: Error;
  constructor(
    message: string,
    code: string,
    url?: string,
    originalError?: Error
  ) {
    super(message);
    this.name = 'ScraperError';
    this.code = code;
    this.url = url;
    this.originalError = originalError;
  }
}

export class RetryExhaustedError extends ScraperError {
  constructor(url: string, attempts: number, originalError?: Error) {
    super(
      `Failed to scrape ${url} after ${attempts} attempts`,
      'RETRY_EXHAUSTED',
      url,
      originalError
    );
    this.name = 'RetryExhaustedError';
  }
}

// =============================================
// SAMPLE SCRAPER CONFIGURATION
// =============================================

export const sampleScraperConfigs: ScraperConfig[] = [
  {
    id: 'demo-industrial-supplier-1',
    supplierId: 'supplier-001',
    name: 'Demo Industrial Supply',
    baseUrl: 'https://example-supplier.com',
    url: 'https://example-supplier.com/products/industrial',
    category: 'industrial_equipment',
    selectors: {
      productList: '.product-item',
      productName: '.product-title',
      productPrice: '.product-price',
      productDescription: '.product-description',
      nextPage: '.pagination-next',
    },
    schedule: 'daily',
    isActive: true,
  },
  {
    id: 'demo-mro-supplier-2',
    supplierId: 'supplier-002',
    name: 'Demo MRO Supply',
    baseUrl: 'https://example-mro.com',
    url: 'https://example-mro.com/mro-products',
    category: 'maintenance_repair',
    selectors: {
      productList: '.catalog-item',
      productName: '.item-name',
      productPrice: '.item-price-value',
      productDescription: '.item-details',
      nextPage: '.next-page-link',
    },
    schedule: 'weekly',
    isActive: true,
  },
];

// =============================================
// SCRAPER SERVICE CLASS
// =============================================

export class ScraperService {
  private browser: Browser | null = null;
  private isInitialized = false;
  private lastRequestTime: number = 0;
  private rateLimitDelay: number = DEFAULT_RATE_LIMIT_DELAY;
  private cache: Map<string, ScrapedDataCache> = new Map();

  constructor(rateLimitDelay: number = DEFAULT_RATE_LIMIT_DELAY) {
    this.rateLimitDelay = rateLimitDelay;
  }

  // =============================================
  // INITIALIZATION
  // =============================================

  /**
   * Initialize the browser instance
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
      });
      this.isInitialized = true;
    } catch (error) {
      throw new ScraperError(
        'Failed to initialize browser',
        'BROWSER_INIT_ERROR',
        undefined,
        error as Error
      );
    }
  }

  /**
   * Close the browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.isInitialized = false;
    }
  }

  // =============================================
  // CORE SCRAPING METHODS
  // =============================================

  /**
   * Scrape a single URL with retry logic
   */
  async scrapeUrl(url: string, config: ScraperConfig): Promise<ScrapingResult> {
    const startTime = Date.now();

    try {
      await this.initialize();
      const products = await this.scrapeWithRetry(url, config);
      const duration = Date.now() - startTime;

      // Save to cache on success
      if (products.length > 0) {
        this.saveToCache(products, config);
      }

      return {
        success: true,
        products,
        scrapedAt: new Date(),
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        products: [],
        scrapedAt: new Date(),
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Scrape with fallback to cached data if scraping fails
   */
  async scrapeWithFallback(url: string, config: ScraperConfig): Promise<ScrapingResult> {
    const startTime = Date.now();

    try {
      // Try to scrape fresh data first
      const result = await this.scrapeUrl(url, config);

      if (result.success && result.products.length > 0) {
        return result;
      }

      // If scraping failed or returned no products, try cache
      throw new Error(result.error || 'No products found');
    } catch (error) {
      // Try to get cached data
      const cached = this.getCachedData(config.supplierId);

      if (cached && cached.products.length > 0) {
        const duration = Date.now() - startTime;
        return {
          success: true,
          products: cached.products,
          scrapedAt: cached.scrapedAt,
          duration,
          error: `Using cached data. Original error: ${error instanceof Error ? error.message : 'Unknown'}`,
        };
      }

      // No cache available, return error
      const duration = Date.now() - startTime;
      return {
        success: false,
        products: [],
        scrapedAt: new Date(),
        duration,
        error: `Scraping failed and no cache available: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    }
  }

  // =============================================
  // RETRY LOGIC
  // =============================================

  /**
   * Scrape with retry logic
   */
  private async scrapeWithRetry(
    url: string,
    config: ScraperConfig,
    maxAttempts: number = DEFAULT_RETRY_ATTEMPTS
  ): Promise<Product[]> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.applyRateLimit();
        return await this.performScrape(url, config);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Scrape attempt ${attempt}/${maxAttempts} failed for ${url}:`, error);

        if (attempt < maxAttempts) {
          const delay = DEFAULT_RETRY_DELAY * attempt;
          console.log(`Waiting ${delay}ms before retry...`);
          await this.delay(delay);
        }
      }
    }

    throw new RetryExhaustedError(url, maxAttempts, lastError);
  }

  /**
   * Perform the actual scraping
   */
  private async performScrape(url: string, config: ScraperConfig): Promise<Product[]> {
    if (!this.browser) {
      throw new ScraperError('Browser not initialized', 'BROWSER_NOT_READY');
    }

    const page = await this.browser.newPage();

    try {
      // Set user agent and viewport
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      await page.setViewport({ width: 1920, height: 1080 });

      // Navigate to page
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: DEFAULT_TIMEOUT,
      });

      // Wait for product list to load
      await page.waitForSelector(config.selectors.productList, {
        timeout: DEFAULT_TIMEOUT,
      });

      // Extract products
      const products = await page.evaluate(
        (selectors, supplierId, baseUrl, category) => {
          const items: Product[] = [];
          const productElements = document.querySelectorAll(selectors.productList);

          productElements.forEach((element, index) => {
            const nameEl = element.querySelector(selectors.productName);
            const priceEl = element.querySelector(selectors.productPrice);
            const descEl = selectors.productDescription
              ? element.querySelector(selectors.productDescription)
              : null;

            if (nameEl && priceEl) {
              const name = nameEl.textContent?.trim() || '';
              const priceText = priceEl.textContent?.trim() || '';
              const description = descEl?.textContent?.trim();

              // Parse price
              const priceMatch = priceText.match(/[\d.,]+/);
              const price = priceMatch
                ? parseFloat(priceMatch[0].replace(/[.,]/g, (m: string) => (m === '.' ? '' : '.')))
                : 0;

              // Detect currency
              const currency = priceText.includes('₺')
                ? 'TRY'
                : priceText.includes('$')
                ? 'USD'
                : priceText.includes('€')
                ? 'EUR'
                : 'TRY';

              const id = `${supplierId}-${Date.now()}-${index}`;

              items.push({
                id,
                name,
                description,
                category,
                supplier: {
                  id: supplierId,
                  name: supplierId,
                } as Supplier,
                price,
                currency,
                unit: 'adet',
                stockStatus: 'in_stock',
                specifications: [],
                url: window.location.href,
                lastUpdated: new Date(),
                scrapedAt: new Date(),
                source: baseUrl,
              });
            }
          });

          return items;
        },
        config.selectors,
        config.supplierId,
        config.baseUrl,
        config.category
      );

      return products;
    } catch (error) {
      throw new ScraperError(
        `Failed to scrape page: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SCRAPE_FAILED',
        url,
        error as Error
      );
    } finally {
      await page.close();
    }
  }

  // =============================================
  // CACHE METHODS
  // =============================================

  /**
   * Get cached products for a supplier
   */
  getCachedData(supplierId?: string): ScrapedDataCache | null {
    // Try memory cache first
    if (supplierId && this.cache.has(supplierId)) {
      return this.cache.get(supplierId)!;
    }

    // Try localStorage cache service
    const cached = cacheService.loadCache();
    if (cached) {
      return cached;
    }

    return null;
  }

  /**
   * Validate if cache is still valid
   */
  validateCache(supplierId?: string, maxAge: number = DEFAULT_CACHE_DURATION): boolean {
    const cache = this.getCachedData(supplierId);
    if (!cache) return false;

    const age = Date.now() - new Date(cache.scrapedAt).getTime();
    return age < maxAge;
  }

  /**
   * Save products to cache
   */
  private saveToCache(products: Product[], config: ScraperConfig): void {
    const cacheData: ScrapedDataCache = {
      products,
      scrapedAt: new Date(),
      source: config.baseUrl,
      status: 'fresh',
    };

    // Save to memory cache
    this.cache.set(config.supplierId, cacheData);

    // Save to persistent cache
    cacheService.saveCache(products, config.baseUrl);
  }

  // =============================================
  // HELPER METHODS
  // =============================================

  /**
   * Delay utility for rate limiting
   */
  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Apply rate limiting between requests
   */
  private async applyRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delayTime = this.rateLimitDelay - timeSinceLastRequest;
      await this.delay(delayTime);
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Generate a unique product ID
   */
  generateProductId(name: string, supplier: string): string {
    const normalizedName = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    const normalizedSupplier = supplier
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);

    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);

    return `${normalizedSupplier}-${normalizedName}-${timestamp}-${random}`;
  }

  /**
   * Parse price text into price and currency
   */
  parsePrice(priceText: string): { price: number; currency: string } {
    if (!priceText || typeof priceText !== 'string') {
      return { price: 0, currency: 'TRY' };
    }

    const trimmed = priceText.trim();

    // Currency detection
    let currency = 'TRY';
    if (trimmed.includes('₺') || trimmed.toLowerCase().includes('tl')) {
      currency = 'TRY';
    } else if (trimmed.includes('$') || trimmed.toLowerCase().includes('usd')) {
      currency = 'USD';
    } else if (trimmed.includes('€') || trimmed.toLowerCase().includes('eur')) {
      currency = 'EUR';
    } else if (trimmed.includes('£')) {
      currency = 'GBP';
    }

    // Extract numeric value
    // Handle various formats: 1.234,56 (European), 1,234.56 (US), 1234.56, 1 234,56
    let numericString = trimmed
      .replace(/[^\d.,\s]/g, '') // Remove currency symbols
      .trim();

    // Handle space as thousand separator (e.g., "1 234,56")
    if (numericString.includes(' ') && numericString.includes(',')) {
      numericString = numericString.replace(/\s/g, '');
    }

    // Detect format and convert
    let price = 0;

    if (numericString.includes(',') && numericString.includes('.')) {
      // Both present - determine which is decimal
      const lastComma = numericString.lastIndexOf(',');
      const lastDot = numericString.lastIndexOf('.');

      if (lastComma > lastDot) {
        // European format: 1.234,56
        numericString = numericString.replace(/\./g, '').replace(',', '.');
      } else {
        // US format: 1,234.56
        numericString = numericString.replace(/,/g, '');
      }
    } else if (numericString.includes(',')) {
      // Only comma - could be decimal (European) or thousand separator
      const parts = numericString.split(',');
      if (parts.length === 2 && parts[1].length === 2) {
        // Likely European decimal
        numericString = numericString.replace(',', '.');
      } else {
        // Likely thousand separator
        numericString = numericString.replace(/,/g, '');
      }
    }

    price = parseFloat(numericString) || 0;

    return { price, currency };
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  /**
   * Scrape multiple URLs with the same config
   */
  async scrapeMultiple(urls: string[], config: ScraperConfig): Promise<ScrapingResult[]> {
    const results: ScrapingResult[] = [];

    for (const url of urls) {
      const result = await this.scrapeUrl(url, config);
      results.push(result);

      // Small delay between pages
      if (urls.indexOf(url) < urls.length - 1) {
        await this.delay(500);
      }
    }

    return results;
  }

  /**
   * Get scraping statistics
   */
  getStats(): {
    isInitialized: boolean;
    cachedSuppliers: number;
    rateLimitDelay: number;
    lastRequestTime: number;
  } {
    return {
      isInitialized: this.isInitialized,
      cachedSuppliers: this.cache.size,
      rateLimitDelay: this.rateLimitDelay,
      lastRequestTime: this.lastRequestTime,
    };
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.cache.clear();
    cacheService.clearCache();
  }
}

// =============================================
// EXPORT SINGLETON INSTANCE
// =============================================

export const scraperService = new ScraperService();

// Export factory function for custom instances
export function createScraperService(rateLimitDelay?: number): ScraperService {
  return new ScraperService(rateLimitDelay);
}

export default ScraperService;
