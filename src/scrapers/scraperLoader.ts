/**
 * Scraper Loader - Conditionally loads scrapers only in Node.js environment
 * This file should only be imported from Electron main process
 */

import type { ScraperConfig, ScrapingResult } from '../types';

// Dynamic import for Node-only modules
export async function loadScraper(config: ScraperConfig) {
  // Only load in Node.js environment
  if (typeof window !== 'undefined') {
    throw new Error('Scrapers can only be loaded in Node.js environment (Electron main process)');
  }

  // Dynamic import to avoid browser bundling issues
  const { KumasciScraper } = await import('./sites/KumasciScraper.js');
  const { KumasFirsatiScraper } = await import('./sites/KumasFirsatiScraper.js');
  const { TekstilTurkiyeScraper } = await import('./sites/TekstilTurkiyeScraper.js');
  
  switch (config.id) {
    case 'kumasci':
      return new KumasciScraper(config);
    case 'kumasfirsati':
      return new KumasFirsatiScraper(config);
    case 'tekstilturkiye':
      return new TekstilTurkiyeScraper(config);
    default:
      throw new Error(`Unknown scraper: ${config.id}`);
  }
}

export async function runScraperInMainProcess(
  config: ScraperConfig
): Promise<ScrapingResult> {
  const scraper = await loadScraper(config);
  return scraper.scrape();
}
