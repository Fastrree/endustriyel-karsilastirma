import { BaseScraper } from '../BaseScraper.js';
import type { Product, ScrapingResult } from '../../types';
import puppeteer from 'puppeteer';

export class KumasFirsatiScraper extends BaseScraper {
  async scrape(): Promise<ScrapingResult> {
    const startTime = Date.now();
    const browser = await puppeteer.launch({
      headless: this.options.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      
      console.log(`[${this.name}] Navigating to ${this.config.baseUrl}`);
      await page.goto(this.config.baseUrl, { 
        waitUntil: 'networkidle2',
        timeout: this.options.timeout,
      });

      // Wait for products to load
      await this.delay(2000);

      // Extract products - Kumas Fırsatı specific selectors
      const products = await page.evaluate(() => {
        const items: any[] = [];
        
        // Common selectors for Turkish e-commerce sites
        const productSelectors = [
          '.product-item',
          '.product',
          '.urun-item',
          '.urun',
          '[data-product]',
          '.kategori-urun',
          '.urun-liste',
        ];
        
        let productElements: NodeListOf<Element> | null = null;
        
        for (const selector of productSelectors) {
          productElements = document.querySelectorAll(selector);
          if (productElements.length > 0) break;
        }

        if (!productElements || productElements.length === 0) {
          // Try to find any grid items with prices
          const allElements = document.querySelectorAll('*');
          for (const el of allElements) {
            const hasPrice = el.textContent?.match(/\d+[,.]?\d*\s*(TL|₺|TRY)/i);
            const hasTitle = el.querySelector('h1, h2, h3, h4');
            if (hasPrice && hasTitle) {
              productElements = [el] as unknown as NodeListOf<Element>;
              break;
            }
          }
        }

        productElements?.forEach((el, index) => {
          try {
            // Name selectors
            const nameSelectors = ['h2', 'h3', 'h4', '.urun-adi', '.product-name', '.title', '[data-name]'];
            let nameEl: Element | null = null;
            for (const sel of nameSelectors) {
              nameEl = el.querySelector(sel);
              if (nameEl) break;
            }
            
            // Price selectors - Turkish Lira patterns
            const priceSelectors = ['.fiyat', '.price', '.urun-fiyat', '[data-price]', '.amount'];
            let priceEl: Element | null = null;
            for (const sel of priceSelectors) {
              priceEl = el.querySelector(sel);
              if (priceEl?.textContent?.match(/\d/)) break;
            }
            
            // If no specific price element, look for TL symbol
            if (!priceEl) {
              const allText = el.textContent || '';
              if (allText.match(/\d+[,.]?\d*\s*(TL|₺|TRY)/i)) {
                priceEl = el;
              }
            }

            // Image
            const imgEl = el.querySelector('img');
            
            // Link
            const linkEl = el.querySelector('a') || el.closest('a');

            if (nameEl && priceEl) {
              items.push({
                index,
                name: nameEl.textContent?.trim() || '',
                price: priceEl.textContent?.trim() || '',
                description: el.querySelector('.description, .aciklama, p')?.textContent?.trim() || '',
                image: imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || '',
                url: linkEl?.getAttribute('href') || '',
              });
            }
          } catch (e) {
            console.error('Error parsing product:', e);
          }
        });

        return items;
      });

      // Convert to Product type
      const convertedProducts: Product[] = products
        .filter(p => p.name && p.price)
        .map((p, i) => {
          const { price, currency } = this.parsePrice(p.price);
          
          return {
            id: this.generateId(p.name || `kumasfirsati-${i}`),
            name: p.name,
            description: p.description || `${p.name} - Kumaş Fırsatı`,
            category: this.config.category || 'Kumaş',
            supplier: {
              id: this.config.supplierId,
              name: 'Kumaş Fırsatı',
              website: this.config.baseUrl,
            },
            price,
            currency,
            unit: 'metre',
            stockStatus: 'in_stock' as const,
            specifications: [],
            images: p.image ? [p.image] : [],
            url: p.url.startsWith('http') ? p.url : `https://kumasfirsati.com${p.url}`,
            scrapedAt: new Date(),
            source: this.config.baseUrl,
            lastUpdated: new Date(),
          };
        });

      const duration = Date.now() - startTime;
      console.log(`[${this.name}] Scraped ${convertedProducts.length} products in ${duration}ms`);

      return {
        success: true,
        products: convertedProducts,
        scrapedAt: new Date(),
        duration,
      };

    } catch (error) {
      console.error(`[${this.name}] Scraping failed:`, error);
      return {
        success: false,
        products: [],
        scrapedAt: new Date(),
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      await browser.close();
    }
  }
}
