import type {
  Product,
  Supplier,
  ScraperConfig,
  ScraperLog,
} from '../types';

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

const isElectron = (): boolean => {
  return typeof window !== 'undefined' && !!(window as Window & { electronAPI?: unknown }).electronAPI;
};

const getElectronAPI = () => {
  return (window as Window & { electronAPI: ElectronAPI }).electronAPI;
};

class DatabaseError extends Error {
  code: string;
  details?: string;
  constructor(
    message: string,
    code: string,
    details?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.details = details;
  }
}

const handleError = (error: unknown, context: string): never => {
  if (error instanceof DatabaseError) {
    throw error;
  }
  
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[DatabaseService] ${context}:`, error);
  throw new DatabaseError(message, 'DB_ERROR', context);
};

const LOCAL_STORAGE_KEYS = {
  products: 'db_products',
  suppliers: 'db_suppliers',
  scrapers: 'db_scrapers',
  scraperLogs: 'db_scraper_logs',
};

const getLocalData = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setLocalData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getAllProducts = async (filters?: ProductFilters): Promise<Product[]> => {
  try {
    if (isElectron()) {
      const result = await getElectronAPI().db.products.getAll(filters);
      return result.success ? result.data : [];
    }

    let products = getLocalData<Product>(LOCAL_STORAGE_KEYS.products);

    if (filters) {
      if (filters.category) {
        products = products.filter(p => p.category === filters.category);
      }
      if (filters.supplierId) {
        products = products.filter(p => p.supplier.id === filters.supplierId);
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        products = products.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query)
        );
      }
      if (filters.minPrice !== undefined) {
        products = products.filter(p => p.price >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        products = products.filter(p => p.price <= filters.maxPrice!);
      }
      if (filters.stockStatus) {
        products = products.filter(p => p.stockStatus === filters.stockStatus);
      }
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price_asc':
            products.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            products.sort((a, b) => b.price - a.price);
            break;
          case 'name_asc':
            products.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'name_desc':
            products.sort((a, b) => b.name.localeCompare(a.name));
            break;
          case 'date_desc':
            products.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
            break;
        }
      }
    }

    return products;
  } catch (error) {
    return handleError(error, 'getAllProducts');
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    if (isElectron()) {
      const result = await getElectronAPI().db.products.getById(id);
      return result.success ? result.data : null;
    }

    const products = getLocalData<Product>(LOCAL_STORAGE_KEYS.products);
    return products.find(p => p.id === id) || null;
  } catch (error) {
    return handleError(error, 'getProductById');
  }
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  try {
    if (isElectron()) {
      const result = await getElectronAPI().db.products.create(product);
      if (!result.success) {
        throw new DatabaseError(result.message || 'Failed to create product', 'CREATE_ERROR');
      }
      return result.data;
    }

    const products = getLocalData<Product>(LOCAL_STORAGE_KEYS.products);
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      lastUpdated: new Date(),
    };
    products.push(newProduct);
    setLocalData(LOCAL_STORAGE_KEYS.products, products);
    return newProduct;
  } catch (error) {
    return handleError(error, 'createProduct');
  }
};

export const updateProduct = async (
  id: string,
  updates: Partial<Omit<Product, 'id'>>
): Promise<Product> => {
  try {
    if (isElectron()) {
      const result = await getElectronAPI().db.products.update(id, updates);
      if (!result.success) {
        throw new DatabaseError(result.message || 'Failed to update product', 'UPDATE_ERROR');
      }
      return result.data;
    }

    const products = getLocalData<Product>(LOCAL_STORAGE_KEYS.products);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new DatabaseError('Product not found', 'NOT_FOUND');
    }
    
    products[index] = {
      ...products[index],
      ...updates,
      id,
      lastUpdated: new Date(),
    };
    setLocalData(LOCAL_STORAGE_KEYS.products, products);
    return products[index];
  } catch (error) {
    return handleError(error, 'updateProduct');
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    if (isElectron()) {
      const result = await getElectronAPI().db.products.delete(id);
      if (!result.success) {
        throw new DatabaseError(result.message || 'Failed to delete product', 'DELETE_ERROR');
      }
      return;
    }

    const products = getLocalData<Product>(LOCAL_STORAGE_KEYS.products);
    const filtered = products.filter(p => p.id !== id);
    setLocalData(LOCAL_STORAGE_KEYS.products, filtered);
  } catch (error) {
    return handleError(error, 'deleteProduct');
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    if (isElectron()) {
      const result = await getElectronAPI().db.products.search(query);
      return result.success ? result.data : [];
    }

    const products = getLocalData<Product>(LOCAL_STORAGE_KEYS.products);
    const searchLower = query.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower) ||
      p.brand?.toLowerCase().includes(searchLower) ||
      p.supplier.name.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    return handleError(error, 'searchProducts');
  }
};

export const getAllSuppliers = async (): Promise<Supplier[]> => {
  try {
    if (isElectron()) {
      const result = await getElectronAPI().db.suppliers.getAll();
      return result.success ? result.data : [];
    }

    return getLocalData<Supplier>(LOCAL_STORAGE_KEYS.suppliers);
  } catch (error) {
    return handleError(error, 'getAllSuppliers');
  }
};

export const getAllScrapers = async (): Promise<ScraperConfig[]> => {
  try {
    if (isElectron()) {
      const result = await getElectronAPI().db.scrapers.getAll();
      return result.success ? result.data : [];
    }

    return getLocalData<ScraperConfig>(LOCAL_STORAGE_KEYS.scrapers);
  } catch (error) {
    return handleError(error, 'getAllScrapers');
  }
};

export const logScraping = async (log: Omit<ScraperLog, 'id'>): Promise<ScraperLog> => {
  try {
    if (isElectron()) {
      const result = await getElectronAPI().db.scrapers.log(log);
      if (!result.success) {
        throw new DatabaseError(result.message || 'Failed to log scraping', 'LOG_ERROR');
      }
      return result.data;
    }

    const logs = getLocalData<ScraperLog>(LOCAL_STORAGE_KEYS.scraperLogs);
    const newLog: ScraperLog = {
      ...log,
      id: crypto.randomUUID(),
    };
    logs.push(newLog);
    setLocalData(LOCAL_STORAGE_KEYS.scraperLogs, logs);
    return newLog;
  } catch (error) {
    return handleError(error, 'logScraping');
  }
};

export const getDatabaseStats = async (): Promise<DatabaseStats> => {
  try {
    if (isElectron()) {
      const result = await getElectronAPI().db.stats.get();
      return result.success ? result.data : getDefaultStats();
    }

    const products = getLocalData<Product>(LOCAL_STORAGE_KEYS.products);
    const suppliers = getLocalData<Supplier>(LOCAL_STORAGE_KEYS.suppliers);
    const scrapers = getLocalData<ScraperConfig>(LOCAL_STORAGE_KEYS.scrapers);

    const productsByCategory: Record<string, number> = {};
    const productsBySupplier: Record<string, number> = {};
    let lastScrapedAt: Date | null = null;

    products.forEach(p => {
      productsByCategory[p.category] = (productsByCategory[p.category] || 0) + 1;
      productsBySupplier[p.supplier.id] = (productsBySupplier[p.supplier.id] || 0) + 1;
      
      const scrapedTime = new Date(p.scrapedAt).getTime();
      if (!lastScrapedAt || scrapedTime > lastScrapedAt.getTime()) {
        lastScrapedAt = new Date(p.scrapedAt);
      }
    });

    return {
      totalProducts: products.length,
      totalSuppliers: suppliers.length,
      totalScrapers: scrapers.length,
      productsByCategory,
      productsBySupplier,
      lastScrapedAt,
      databaseSize: 0,
    };
  } catch (error) {
    return handleError(error, 'getDatabaseStats');
  }
};

const getDefaultStats = (): DatabaseStats => ({
  totalProducts: 0,
  totalSuppliers: 0,
  totalScrapers: 0,
  productsByCategory: {},
  productsBySupplier: {},
  lastScrapedAt: null,
  databaseSize: 0,
});

export interface ScraperResult {
  success: boolean;
  products: Product[];
  error?: string;
  stack?: string;
  scrapedAt: Date;
  duration: number;
}

export const runScraper = async (scraperId: string): Promise<ScraperResult> => {
  try {
    if (isElectron()) {
      const result = await getElectronAPI().scraper.run(scraperId);
      if (!result.success) {
        throw new DatabaseError(result.error || 'Failed to run scraper', 'SCRAPER_ERROR');
      }
      return result.data;
    }
    throw new DatabaseError('Scraping only available in Electron', 'NOT_SUPPORTED');
  } catch (error) {
    return handleError(error, 'runScraper');
  }
};

export const runAllScrapers = async (): Promise<ScraperResult[]> => {
  try {
    if (isElectron()) {
      const result = await getElectronAPI().scraper.runAll();
      if (!result.success) {
        throw new DatabaseError(result.error || 'Failed to run scrapers', 'SCRAPER_ERROR');
      }
      return result.data;
    }
    throw new DatabaseError('Scraping only available in Electron', 'NOT_SUPPORTED');
  } catch (error) {
    return handleError(error, 'runAllScrapers');
  }
};

export const stopScraper = async (scraperId: string): Promise<void> => {
  try {
    if (isElectron()) {
      const result = await getElectronAPI().scraper.stop(scraperId);
      if (!result.success) {
        throw new DatabaseError(result.error || 'Failed to stop scraper', 'SCRAPER_ERROR');
      }
      return;
    }
    throw new DatabaseError('Scraping only available in Electron', 'NOT_SUPPORTED');
  } catch (error) {
    return handleError(error, 'stopScraper');
  }
};

export interface ElectronAPI {
  platform: string;
  db: {
    products: {
      getAll: (filters?: ProductFilters) => Promise<{ success: boolean; data: Product[]; message?: string }>;
      getById: (id: string) => Promise<{ success: boolean; data: Product | null; message?: string }>;
      create: (product: Omit<Product, 'id'>) => Promise<{ success: boolean; data: Product; message?: string }>;
      update: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; data: Product; message?: string }>;
      delete: (id: string) => Promise<{ success: boolean; message?: string }>;
      search: (query: string) => Promise<{ success: boolean; data: Product[]; message?: string }>;
    };
    suppliers: {
      getAll: () => Promise<{ success: boolean; data: Supplier[]; message?: string }>;
    };
    scrapers: {
      getAll: () => Promise<{ success: boolean; data: ScraperConfig[]; message?: string }>;
      log: (log: Omit<ScraperLog, 'id'>) => Promise<{ success: boolean; data: ScraperLog; message?: string }>;
    };
    stats: {
      get: () => Promise<{ success: boolean; data: DatabaseStats; message?: string }>;
    };
  };
  scraper: {
    run: (scraperId: string) => Promise<{ success: boolean; data: ScraperResult; error?: string }>;
    runAll: () => Promise<{ success: boolean; data: ScraperResult[]; error?: string }>;
    stop: (scraperId: string) => Promise<{ success: boolean; error?: string }>;
  };
  onScraperProgress: (callback: (data: { scraperId: string; progress: number; status: string }) => void) => void;
  removeScraperProgressListener: () => void;
}
