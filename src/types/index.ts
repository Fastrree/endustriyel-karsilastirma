// =============================================
// PRODUCT TYPES
// =============================================

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  sku?: string;
  brand?: string;
  supplier: Supplier;
  price: number;
  currency: string;
  unit: string;
  minOrderQuantity?: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  specifications: ProductSpecification[];
  images?: string[];
  url?: string;
  lastUpdated: Date;
  isFavorite?: boolean;
  scrapedAt: Date;
  source: string;
  isCached?: boolean;
}

export interface ProductSpecification {
  key: string;
  value: string;
  unit?: string;
}

// =============================================
// SUPPLIER TYPES
// =============================================

export interface Supplier {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  contactInfo?: ContactInfo;
  rating?: number;
  reliability?: number;
  lastScraped?: Date;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}

// =============================================
// COMPARISON TYPES
// =============================================

export interface ComparisonItem {
  product: Product;
  addedAt: Date;
  notes?: string;
}

export interface ComparisonState {
  items: ComparisonItem[];
  maxItems: number;
}

// =============================================
// FILTER TYPES
// =============================================

export interface FilterState {
  searchQuery: string;
  categories: string[];
  suppliers: string[];
  priceRange: {
    min: number | null;
    max: number | null;
  };
  stockStatus: ('in_stock' | 'low_stock' | 'out_of_stock')[];
  sortBy: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'date_desc';
}

// =============================================
// SCRAPER TYPES
// =============================================

export interface ScraperConfig {
  id: string;
  supplierId: string;
  url: string;
  name: string;
  baseUrl: string;
  category: string;
  selectors: {
    productList: string;
    productName: string;
    productPrice: string;
    productDescription?: string;
    nextPage?: string;
  };
  schedule: 'manual' | 'hourly' | 'daily' | 'weekly';
  isActive: boolean;
  lastRun?: Date;
  lastStatus?: 'success' | 'error' | 'running';
}

export interface ScraperLog {
  id: string;
  scraperId: string;
  status: 'success' | 'error' | 'running';
  message: string;
  itemsScraped: number;
  startedAt: Date;
  completedAt?: Date;
  errorDetails?: string;
}

export interface ScrapedDataCache {
  products: Product[];
  scrapedAt: Date;
  source: string;
  status: 'fresh' | 'stale' | 'error';
  errorMessage?: string;
}

export interface ScrapingResult {
  success: boolean;
  products: Product[];
  scrapedAt: Date;
  duration: number;
  error?: string;
}

// =============================================
// APP STATE TYPES
// =============================================

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  language: 'tr' | 'en';
  notifications: boolean;
  autoUpdate: boolean;
  defaultCurrency: string;
}

export interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv';
  includeImages: boolean;
  includeSpecs: boolean;
  template?: string;
}

// =============================================
// UI STATE TYPES
// =============================================

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

// =============================================
// API RESPONSE TYPES
// =============================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
