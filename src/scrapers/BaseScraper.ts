import type { ScrapingResult, ScraperConfig } from '../types';

export interface ScraperOptions {
  headless?: boolean;
  delay?: number;
  timeout?: number;
  maxRetries?: number;
}

export abstract class BaseScraper {
  protected config: ScraperConfig;
  protected options: ScraperOptions;
  protected name: string;

  constructor(config: ScraperConfig, options: ScraperOptions = {}) {
    this.config = config;
    this.options = {
      headless: true,
      delay: 1000,
      timeout: 30000,
      maxRetries: 3,
      ...options,
    };
    this.name = config.name;
  }

  abstract scrape(): Promise<ScrapingResult>;
  
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected generateId(name: string): string {
    return `${this.config.id}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50)}`;
  }

  protected parsePrice(priceText: string): { price: number; currency: string } {
    const cleaned = priceText.replace(/\s+/g, '').trim();
    
    // Try to find currency
    let currency = 'TRY';
    if (cleaned.includes('USD') || cleaned.includes('$')) currency = 'USD';
    else if (cleaned.includes('EUR') || cleaned.includes('€')) currency = 'EUR';
    else if (cleaned.includes('GBP') || cleaned.includes('£')) currency = 'GBP';
    
    // Extract number
    const match = cleaned.match(/[\d.,]+/);
    if (!match) return { price: 0, currency };
    
    // Parse number (handle both 1.234,56 and 1,234.56 formats)
    let numStr = match[0];
    if (numStr.includes(',') && numStr.includes('.')) {
      // 1,234.56 format
      numStr = numStr.replace(/,/g, '');
    } else if (numStr.includes(',')) {
      // Could be 1.234,56 (European) or just separator
      const parts = numStr.split(',');
      if (parts.length === 2 && parts[1].length === 2) {
        // 1.234,56 format
        numStr = numStr.replace(/\./g, '').replace(',', '.');
      } else {
        numStr = numStr.replace(/,/g, '');
      }
    }
    
    return { price: parseFloat(numStr), currency };
  }
}
