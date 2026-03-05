import { BaseScraper } from '../BaseScraper.js';
import type { Product, ScrapingResult, Supplier } from '../../types';
import puppeteer from 'puppeteer';

/**
 * Tekstil Türkiye Scraper
 * This site is a B2B directory, so we extract company/product listings
 */
export class TekstilTurkiyeScraper extends BaseScraper {
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

      await this.delay(2000);

      // Extract company/product listings
      const items = await page.evaluate(() => {
        const results: any[] = [];
        
        // Try various selectors for Turkish B2B sites
        const selectors = [
          '.company-item',
          '.firma-item',
          '.listing-item',
          '.urun-item',
          '.product-item',
          '[data-company]',
          '.ilan-item',
        ];
        
        let elements: NodeListOf<Element> | null = null;
        for (const selector of selectors) {
          elements = document.querySelectorAll(selector);
          if (elements.length > 0) break;
        }

        elements?.forEach((el, index) => {
          try {
            // Company/Product name
            const nameSelectors = ['h2', 'h3', '.title', '.firma-adi', '.urun-adi', 'a'];
            let nameEl: Element | null = null;
            for (const sel of nameSelectors) {
              nameEl = el.querySelector(sel);
              if (nameEl?.textContent?.trim()) break;
            }

            // Description
            const descEl = el.querySelector('.description, .aciklama, p, .ozet');
            
            // Category
            const catEl = el.querySelector('.category, .kategori');
            
            // Location
            const locEl = el.querySelector('.location, .konum, .sehir');
            
            // Contact/Phone
            const phoneEl = el.querySelector('.phone, .telefon, .iletisim');
            
            // Link
            const linkEl = el.querySelector('a');

            if (nameEl) {
              results.push({
                index,
                name: nameEl.textContent?.trim() || '',
                description: descEl?.textContent?.trim() || '',
                category: catEl?.textContent?.trim() || '',
                location: locEl?.textContent?.trim() || '',
                phone: phoneEl?.textContent?.trim() || '',
                url: linkEl?.getAttribute('href') || '',
              });
            }
          } catch (e) {
            console.error('Error parsing item:', e);
          }
        });

        return results;
      });

      // Convert to products (B2B listings don't always have prices)
      const products: Product[] = items
        .filter(item => item.name)
        .map((item, i) => {
          const supplier: Supplier = {
            id: `tekstilturkiye-${i}`,
            name: item.name,
            website: item.url.startsWith('http') ? item.url : `https://tekstilturkiye.net${item.url}`,
            contactInfo: item.phone ? { phone: item.phone } : undefined,
          };

          return {
            id: this.generateId(item.name),
            name: item.name,
            description: item.description || `${item.name} - ${item.category || 'Tekstil Ürünü'}`,
            category: item.category || this.config.category || 'Tekstil',
            supplier,
            price: 0, // B2B sites often don't show prices
            currency: 'TRY',
            unit: 'adet',
            stockStatus: 'in_stock' as const,
            specifications: [
              ...(item.location ? [{ key: 'Konum', value: item.location }] : []),
              ...(item.phone ? [{ key: 'İletişim', value: item.phone }] : []),
            ],
            url: supplier.website,
            scrapedAt: new Date(),
            source: this.config.baseUrl,
            lastUpdated: new Date(),
          };
        });

      const duration = Date.now() - startTime;
      console.log(`[${this.name}] Scraped ${products.length} items in ${duration}ms`);

      return {
        success: true,
        products,
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
