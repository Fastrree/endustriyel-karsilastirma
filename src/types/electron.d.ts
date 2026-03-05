import type {
  Product,
  Supplier,
  ScraperConfig,
  ScraperLog,
} from './index';

export interface ProductFilters {
  category?: string;
  supplierId?: string;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: Product['stockStatus'];
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'date_desc';
}

export interface DatabaseStats {
  totalProducts: number;
  totalSuppliers: number;
  totalScrapers: number;
  productsByCategory: Record<string, number>;
  productsBySupplier: Record<string, number>;
  lastScrapedAt: Date | null;
  databaseSize: number;
}

export interface ElectronAPI {
  platform: string;
  db: {
    products: {
      getAll: (filters?: ProductFilters) => Promise<{
        success: boolean;
        data: Product[];
        message?: string;
      }>;
      getById: (id: string) => Promise<{
        success: boolean;
        data: Product | null;
        message?: string;
      }>;
      create: (product: Omit<Product, 'id'>) => Promise<{
        success: boolean;
        data: Product;
        message?: string;
      }>;
      update: (id: string, updates: Partial<Product>) => Promise<{
        success: boolean;
        data: Product;
        message?: string;
      }>;
      delete: (id: string) => Promise<{
        success: boolean;
        message?: string;
      }>;
      search: (query: string) => Promise<{
        success: boolean;
        data: Product[];
        message?: string;
      }>;
    };
    suppliers: {
      getAll: () => Promise<{
        success: boolean;
        data: Supplier[];
        message?: string;
      }>;
      getById: (id: string) => Promise<{
        success: boolean;
        data: Supplier | null;
        message?: string;
      }>;
      create: (supplier: Omit<Supplier, 'id'>) => Promise<{
        success: boolean;
        data: Supplier;
        message?: string;
      }>;
      update: (id: string, updates: Partial<Supplier>) => Promise<{
        success: boolean;
        data: Supplier;
        message?: string;
      }>;
      delete: (id: string) => Promise<{
        success: boolean;
        message?: string;
      }>;
    };
    scrapers: {
      getAll: () => Promise<{
        success: boolean;
        data: ScraperConfig[];
        message?: string;
      }>;
      getById: (id: string) => Promise<{
        success: boolean;
        data: ScraperConfig | null;
        message?: string;
      }>;
      create: (scraper: Omit<ScraperConfig, 'id'>) => Promise<{
        success: boolean;
        data: ScraperConfig;
        message?: string;
      }>;
      update: (id: string, updates: Partial<ScraperConfig>) => Promise<{
        success: boolean;
        data: ScraperConfig;
        message?: string;
      }>;
      delete: (id: string) => Promise<{
        success: boolean;
        message?: string;
      }>;
      log: (log: Omit<ScraperLog, 'id'>) => Promise<{
        success: boolean;
        data: ScraperLog;
        message?: string;
      }>;
      getLogs: (scraperId?: string) => Promise<{
        success: boolean;
        data: ScraperLog[];
        message?: string;
      }>;
    };
    stats: {
      get: () => Promise<{
        success: boolean;
        data: DatabaseStats;
        message?: string;
      }>;
    };
  };
  scraper: {
    run: (scraperId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    runAll: () => Promise<{ success: boolean; data?: any; error?: string }>;
    stop: (scraperId: string) => Promise<{ success: boolean; error?: string }>;
  };
  onScraperProgress: (callback: (data: { scraperId: string; progress: number; status: string }) => void) => void;
  removeScraperProgressListener: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
