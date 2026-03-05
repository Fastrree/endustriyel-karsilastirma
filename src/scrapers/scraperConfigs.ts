import type { ScraperConfig } from '../types';

export const scraperConfigs: ScraperConfig[] = [
  {
    id: 'kumasci',
    name: 'Kumaşçı',
    supplierId: 'kumasci',
    url: 'https://kumasci.com/shop',
    baseUrl: 'https://kumasci.com/shop',
    category: 'Endüstriyel Kumaş',
    selectors: {
      productList: '.product-item, .product',
      productName: '.product-title, h2, h3',
      productPrice: '.price, .amount',
      productDescription: '.description',
    },
    schedule: 'daily',
    isActive: true,
  },
  {
    id: 'kumasfirsati',
    name: 'Kumaş Fırsatı',
    supplierId: 'kumasfirsati',
    url: 'https://kumasfirsati.com',
    baseUrl: 'https://kumasfirsati.com',
    category: 'Kumaş',
    selectors: {
      productList: '.urun-item, .product-item, .urun',
      productName: '.urun-adi, h2, h3',
      productPrice: '.fiyat, .price',
      productDescription: '.aciklama',
    },
    schedule: 'daily',
    isActive: true,
  },
  {
    id: 'tekstilturkiye',
    name: 'Tekstil Türkiye',
    supplierId: 'tekstilturkiye',
    url: 'https://tekstilturkiye.net',
    baseUrl: 'https://tekstilturkiye.net',
    category: 'Tekstil Firmaları',
    selectors: {
      productList: '.firma-item, .company-item, .ilan-item',
      productName: 'h2, h3, .firma-adi',
      productPrice: '.fiyat',
      productDescription: '.aciklama',
    },
    schedule: 'weekly',
    isActive: true,
  },
];

export function getScraperConfig(id: string): ScraperConfig | undefined {
  return scraperConfigs.find(c => c.id === id);
}

export function getActiveScrapers(): ScraperConfig[] {
  return scraperConfigs.filter(c => c.isActive);
}
