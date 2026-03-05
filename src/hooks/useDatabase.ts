import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  Product,
  Supplier,
  ScraperConfig,
  ScraperLog,
} from '../types';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getAllSuppliers,
  getAllScrapers,
  logScraping,
  getDatabaseStats,
  type ProductFilters,
  type DatabaseStats,
} from '../services/databaseService';

export interface UseDatabaseState {
  isLoading: boolean;
  error: string | null;
  products: Product[];
  suppliers: Supplier[];
  scrapers: ScraperConfig[];
  currentProduct: Product | null;
  stats: DatabaseStats | null;
}

export interface UseDatabaseActions {
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  saveProduct: (product: Omit<Product, 'id'>, id?: string) => Promise<Product>;
  removeProduct: (id: string) => Promise<void>;
  searchProductsQuery: (query: string) => Promise<void>;
  fetchSuppliers: () => Promise<void>;
  fetchScrapers: () => Promise<void>;
  logScrapingRun: (log: Omit<ScraperLog, 'id'>) => Promise<ScraperLog>;
  fetchStats: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export interface UseDatabaseOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onError?: (error: string) => void;
}

export const useDatabase = (options: UseDatabaseOptions = {}): UseDatabaseState & UseDatabaseActions => {
  const { autoRefresh = false, refreshInterval = 30000, onError } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [scrapers, setScrapers] = useState<ScraperConfig[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFiltersRef = useRef<ProductFilters | undefined>(undefined);

  const handleError = useCallback((err: unknown, context: string): void => {
    let errorMessage = 'An unexpected error occurred';
    
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    
    console.error(`[useDatabase] ${context}:`, err);
    setError(errorMessage);
    onError?.(errorMessage);
  }, [onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    clearError();
    lastFiltersRef.current = filters;
    
    try {
      const data = await getAllProducts(filters);
      if (!abortControllerRef.current.signal.aborted) {
        setProducts(data);
      }
    } catch (err) {
      if (!abortControllerRef.current.signal.aborted) {
        handleError(err, 'fetchProducts');
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [handleError, clearError]);

  const fetchProduct = useCallback(async (id: string) => {
    setIsLoading(true);
    clearError();
    
    try {
      const product = await getProductById(id);
      setCurrentProduct(product);
    } catch (err) {
      handleError(err, 'fetchProduct');
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  const saveProduct = useCallback(async (
    product: Omit<Product, 'id'>,
    id?: string
  ): Promise<Product> => {
    setIsLoading(true);
    clearError();
    
    try {
      const savedProduct = id
        ? await updateProduct(id, product)
        : await createProduct(product);
      
      if (id) {
        setCurrentProduct(savedProduct);
        setProducts(prev =>
          prev.map(p => (p.id === id ? savedProduct : p))
        );
      } else {
        setProducts(prev => [...prev, savedProduct]);
      }
      
      return savedProduct;
    } catch (err) {
      handleError(err, 'saveProduct');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  const removeProduct = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    clearError();
    
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      if (currentProduct?.id === id) {
        setCurrentProduct(null);
      }
    } catch (err) {
      handleError(err, 'removeProduct');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError, currentProduct?.id]);

  const searchProductsQuery = useCallback(async (query: string) => {
    setIsLoading(true);
    clearError();
    
    try {
      const results = await searchProducts(query);
      setProducts(results);
    } catch (err) {
      handleError(err, 'searchProducts');
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    clearError();
    
    try {
      const data = await getAllSuppliers();
      setSuppliers(data);
    } catch (err) {
      handleError(err, 'fetchSuppliers');
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  const fetchScrapers = useCallback(async () => {
    setIsLoading(true);
    clearError();
    
    try {
      const data = await getAllScrapers();
      setScrapers(data);
    } catch (err) {
      handleError(err, 'fetchScrapers');
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  const logScrapingRun = useCallback(async (
    log: Omit<ScraperLog, 'id'>
  ): Promise<ScraperLog> => {
    try {
      const savedLog = await logScraping(log);
      return savedLog;
    } catch (err) {
      handleError(err, 'logScrapingRun');
      throw err;
    }
  }, [handleError]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getDatabaseStats();
      setStats(data);
    } catch (err) {
      handleError(err, 'fetchStats');
    }
  }, [handleError]);

  const refresh = useCallback(async () => {
    await Promise.all([
      fetchProducts(lastFiltersRef.current),
      fetchSuppliers(),
      fetchScrapers(),
      fetchStats(),
    ]);
  }, [fetchProducts, fetchSuppliers, fetchScrapers, fetchStats]);

  useEffect(() => {
    if (autoRefresh) {
      refresh();
      
      refreshTimeoutRef.current = setInterval(() => {
        refresh();
      }, refreshInterval);
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
      abortControllerRef.current?.abort();
    };
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    isLoading,
    error,
    products,
    suppliers,
    scrapers,
    currentProduct,
    stats,
    fetchProducts,
    fetchProduct,
    saveProduct,
    removeProduct,
    searchProductsQuery,
    fetchSuppliers,
    fetchScrapers,
    logScrapingRun,
    fetchStats,
    refresh,
    clearError,
  };
};

export default useDatabase;
