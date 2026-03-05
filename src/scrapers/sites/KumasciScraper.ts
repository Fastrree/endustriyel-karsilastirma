import { BaseScraper } from '../BaseScraper.js';
import type { Product, ScrapingResult } from '../../types';
import puppeteer from 'puppeteer';

export class KumasciScraper extends BaseScraper {
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

      // Wait for product grid
      await page.waitForSelector('.product-item, .product, [data-product]', { 
        timeout: 10000 
      }).catch(() => {
        console.log(`[${this.name}] No product selector found, trying generic...`);
      });

      // Extract products
      const products = await page.evaluate((config) => {
        const items: any[] = [];
        const selectors = config.selectors;
        
        // Try multiple possible selectors
        const productElements = document.querySelectorAll(
          selectors.productList || '.product-item, .product, .item, [data-product]'
        );

        productElements.forEach((el, index) => {
          try {
            const nameEl = el.querySelector(selectors.productName) || 
                          el.querySelector('h2, h3, .title, .product-title, [data-name]');
            const priceEl = el.querySelector(selectors.productPrice) || 
                           el.querySelector('.price, .amount, [data-price]');
            const descEl = el.querySelector(selectors.productDescription || '.description, .desc');
            const imgEl = el.querySelector('img');
            const linkEl = el.querySelector('a');

            if (nameEl && priceEl) {
              items.push({
                index,
                name: nameEl.textContent?.trim() || '',
                price: priceEl.textContent?.trim() || '',
                description: descEl?.textContent?.trim() || '',
                image: imgEl?.getAttribute('src') || '',
                url: linkEl?.getAttribute('href') || '',
              });
            }
          } catch (e) {
            console.error('Error parsing product:', e);
          }
        });

        return items;
      }, this.config);

      // Convert to Product type
      const convertedProducts: Product[] = products.map((p, i) => {
        const { price, currency } = this.parsePrice(p.price);
        
        return {
          id: this.generateId(p.name || `product-${i}`),
          name: p.name,
          description: p.description,
          category: this.config.category || 'Kumaş',
          supplier: {
            id: this.config.supplierId,
            name: 'Kumaşçı',
            website: this.config.baseUrl,
          },
          price,
          currency,
          unit: 'metre',
          stockStatus: 'in_stock' as const,
          specifications: [],
          images: p.image ? [p.image] : [],
          url: p.url.startsWith('http') ? p.url : `${this.config.baseUrl}${p.url}`,
          scrapedAt: new Date(),
          source: this.config.baseUrl,
          lastUpdated: new Date(),
        };
      }).filter(p => p.name && p.price > 0);

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
