import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Product, 
  ComparisonState, 
  FilterState, 
  AppSettings,
  Notification 
} from '../types';

// =============================================
// PRODUCT STORE
// =============================================

interface ProductStore {
  products: Product[];
  filteredProducts: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  toggleFavorite: (id: string) => void;
  
  // Getters
  getProductById: (id: string) => Product | undefined;
  getProductsBySupplier: (supplierId: string) => Product[];
  getProductsByCategory: (category: string) => Product[];
  getFavoriteProducts: () => Product[];
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  filteredProducts: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  
  setProducts: (products) => set({ products, filteredProducts: products }),
  
  addProduct: (product) => set((state) => ({
    products: [...state.products, product],
    filteredProducts: [...state.filteredProducts, product],
  })),
  
  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    ),
    filteredProducts: state.filteredProducts.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    ),
  })),
  
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter((p) => p.id !== id),
    filteredProducts: state.filteredProducts.filter((p) => p.id !== id),
  })),
  
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  toggleFavorite: (id) => set((state) => ({
    products: state.products.map((p) =>
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ),
  })),
  
  getProductById: (id) => get().products.find((p) => p.id === id),
  getProductsBySupplier: (supplierId) =>
    get().products.filter((p) => p.supplier.id === supplierId),
  getProductsByCategory: (category) =>
    get().products.filter((p) => p.category === category),
  getFavoriteProducts: () =>
    get().products.filter((p) => p.isFavorite),
}));

// =============================================
// FILTER STORE
// =============================================

interface FilterStore {
  filters: FilterState;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setCategories: (categories: string[]) => void;
  toggleCategory: (category: string) => void;
  setSuppliers: (suppliers: string[]) => void;
  toggleSupplier: (supplier: string) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  setStockStatus: (status: FilterState['stockStatus']) => void;
  toggleStockStatus: (status: 'in_stock' | 'low_stock' | 'out_of_stock') => void;
  setSortBy: (sortBy: FilterState['sortBy']) => void;
  resetFilters: () => void;
  applyFilters: (products: Product[]) => Product[];
}

const defaultFilters: FilterState = {
  searchQuery: '',
  categories: [],
  suppliers: [],
  priceRange: { min: null, max: null },
  stockStatus: [],
  sortBy: 'date_desc',
};

export const useFilterStore = create<FilterStore>((set, get) => ({
  filters: defaultFilters,
  
  setSearchQuery: (query) =>
    set((state) => ({ filters: { ...state.filters, searchQuery: query } })),
  
  setCategories: (categories) =>
    set((state) => ({ filters: { ...state.filters, categories } })),
  
  toggleCategory: (category) =>
    set((state) => {
      const categories = state.filters.categories.includes(category)
        ? state.filters.categories.filter((c) => c !== category)
        : [...state.filters.categories, category];
      return { filters: { ...state.filters, categories } };
    }),
  
  setSuppliers: (suppliers) =>
    set((state) => ({ filters: { ...state.filters, suppliers } })),
  
  toggleSupplier: (supplier) =>
    set((state) => {
      const suppliers = state.filters.suppliers.includes(supplier)
        ? state.filters.suppliers.filter((s) => s !== supplier)
        : [...state.filters.suppliers, supplier];
      return { filters: { ...state.filters, suppliers } };
    }),
  
  setPriceRange: (min, max) =>
    set((state) => ({
      filters: { ...state.filters, priceRange: { min, max } },
    })),
  
  setStockStatus: (stockStatus) =>
    set((state) => ({ filters: { ...state.filters, stockStatus } })),
  
  toggleStockStatus: (status) =>
    set((state) => {
      const stockStatus = state.filters.stockStatus.includes(status)
        ? state.filters.stockStatus.filter((s) => s !== status)
        : [...state.filters.stockStatus, status];
      return { filters: { ...state.filters, stockStatus } };
    }),
  
  setSortBy: (sortBy) =>
    set((state) => ({ filters: { ...state.filters, sortBy } })),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  applyFilters: (products) => {
    const { filters } = get();
    let result = [...products];
    
    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.sku?.toLowerCase().includes(query)
      );
    }
    
    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category));
    }
    
    // Supplier filter
    if (filters.suppliers.length > 0) {
      result = result.filter((p) => filters.suppliers.includes(p.supplier.id));
    }
    
    // Price range filter
    if (filters.priceRange.min !== null) {
      result = result.filter((p) => p.price >= filters.priceRange.min!);
    }
    if (filters.priceRange.max !== null) {
      result = result.filter((p) => p.price <= filters.priceRange.max!);
    }
    
    // Stock status filter
    if (filters.stockStatus.length > 0) {
      result = result.filter((p) => filters.stockStatus.includes(p.stockStatus));
    }
    
    // Sorting
    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'date_desc':
        result.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
        break;
    }
    
    return result;
  },
}));

// =============================================
// COMPARISON STORE
// =============================================

interface ComparisonStore {
  comparison: ComparisonState;
  
  // Actions
  addToComparison: (product: Product) => boolean;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
  canAddMore: () => boolean;
}

export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      comparison: {
        items: [],
        maxItems: 4,
      },
      
      addToComparison: (product) => {
        const { comparison } = get();
        
        if (comparison.items.length >= comparison.maxItems) {
          return false;
        }
        
        if (comparison.items.some((item) => item.product.id === product.id)) {
          return false;
        }
        
        set((state) => ({
          comparison: {
            ...state.comparison,
            items: [
              ...state.comparison.items,
              { product, addedAt: new Date() },
            ],
          },
        }));
        
        return true;
      },
      
      removeFromComparison: (productId) =>
        set((state) => ({
          comparison: {
            ...state.comparison,
            items: state.comparison.items.filter(
              (item) => item.product.id !== productId
            ),
          },
        })),
      
      clearComparison: () =>
        set((state) => ({
          comparison: {
            ...state.comparison,
            items: [],
          },
        })),
      
      isInComparison: (productId) =>
        get().comparison.items.some((item) => item.product.id === productId),
      
      canAddMore: () =>
        get().comparison.items.length < get().comparison.maxItems,
    }),
    {
      name: 'endustriyel-comparison',
    }
  )
);

// =============================================
// SETTINGS STORE (PERSISTED)
// =============================================

interface SettingsStore {
  settings: AppSettings;
  
  // Actions
  setTheme: (theme: AppSettings['theme']) => void;
  setLanguage: (language: AppSettings['language']) => void;
  toggleNotifications: () => void;
  toggleAutoUpdate: () => void;
  setDefaultCurrency: (currency: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  language: 'tr',
  notifications: true,
  autoUpdate: true,
  defaultCurrency: 'TRY',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      
      setTheme: (theme) =>
        set((state) => ({
          settings: { ...state.settings, theme },
        })),
      
      setLanguage: (language) =>
        set((state) => ({
          settings: { ...state.settings, language },
        })),
      
      toggleNotifications: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: !state.settings.notifications,
          },
        })),
      
      toggleAutoUpdate: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            autoUpdate: !state.settings.autoUpdate,
          },
        })),
      
      setDefaultCurrency: (currency) =>
        set((state) => ({
          settings: { ...state.settings, defaultCurrency: currency },
        })),
      
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: 'endustriyel-settings',
    }
  )
);

// =============================================
// NOTIFICATION STORE
// =============================================

interface NotificationStore {
  notifications: Notification[];
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          isRead: false,
        },
        ...state.notifications,
      ].slice(0, 50), // Keep only last 50 notifications
    })),
  
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),
  
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),
  
  clearAll: () => set({ notifications: [] }),
  
  getUnreadCount: () =>
    get().notifications.filter((n) => !n.isRead).length,
}));

// =============================================
// SCRAPING STORE
// =============================================

interface ScrapingStore {
  // State
  isScraping: boolean;
  scrapingProgress: number;
  scrapingMessage: string;
  lastScrapeTime: Date | null;
  scrapeError: string | null;
  useCachedData: boolean;
  cacheAge: number | null;

  // Actions
  startScraping: (message?: string) => void;
  updateProgress: (progress: number, message?: string) => void;
  finishScraping: (success: boolean, error?: string) => void;
  setUseCachedData: (useCache: boolean) => void;
  clearScrapeError: () => void;
  resetScrapingState: () => void;
  loadFromCache: () => Promise<boolean>;
  forceRefresh: () => Promise<void>;
}

export const useScrapingStore = create<ScrapingStore>()(
  persist(
    (set, get) => ({
      isScraping: false,
      scrapingProgress: 0,
      scrapingMessage: '',
      lastScrapeTime: null,
      scrapeError: null,
      useCachedData: false,
      cacheAge: null,

      startScraping: (message = 'Veriler güncelleniyor...') => set({
        isScraping: true,
        scrapingProgress: 0,
        scrapingMessage: message,
        scrapeError: null,
        useCachedData: false,
      }),

      updateProgress: (progress, message) => set({
        scrapingProgress: progress,
        ...(message && { scrapingMessage: message }),
      }),

      finishScraping: (success, error) => set({
        isScraping: false,
        scrapingProgress: success ? 100 : 0,
        scrapingMessage: success ? 'Güncelleme tamamlandı' : 'Güncelleme başarısız',
        lastScrapeTime: success ? new Date() : get().lastScrapeTime,
        scrapeError: error || null,
        useCachedData: !success && get().useCachedData,
      }),

      setUseCachedData: (useCache) => set({ useCachedData: useCache }),

      clearScrapeError: () => set({ scrapeError: null }),

      resetScrapingState: () => set({
        isScraping: false,
        scrapingProgress: 0,
        scrapingMessage: '',
        scrapeError: null,
      }),

      loadFromCache: async () => {
        try {
          const { cacheService } = await import('../services/cacheService');
          const cached = cacheService.getCachedProducts();

          if (cached && cached.products.length > 0) {
            const { useProductStore } = await import('./index');
            useProductStore.getState().setProducts(cached.products);

            set({
              useCachedData: true,
              cacheAge: cached.age,
              lastScrapeTime: new Date(Date.now() - cached.age),
            });

            return true;
          }

          return false;
        } catch (error) {
          console.error('Failed to load from cache:', error);
          return false;
        }
      },

      forceRefresh: async () => {
        set({
          isScraping: true,
          scrapingProgress: 0,
          scrapingMessage: 'Veriler yenileniyor...',
          useCachedData: false,
        });

        // This will be implemented with actual scraper calls
        // For now, it's a placeholder that simulates a refresh
        setTimeout(() => {
          set({
            isScraping: false,
            scrapingProgress: 100,
            lastScrapeTime: new Date(),
          });
        }, 2000);
      },
    }),
    {
      name: 'endustriyel-scraping',
      partialize: (state) => ({
        lastScrapeTime: state.lastScrapeTime,
        useCachedData: state.useCachedData,
      }),
    }
  )
);
