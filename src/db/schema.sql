-- SQLite Schema for Endustriyel Karsilastirma

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    website TEXT,
    logo TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    contact_address TEXT,
    rating REAL,
    reliability REAL,
    last_scraped DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    category TEXT,
    subcategory TEXT,
    sku TEXT,
    brand TEXT,
    supplier_id TEXT,
    price REAL,
    currency TEXT,
    unit TEXT,
    min_order_quantity INTEGER,
    stock_status TEXT CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
    specifications TEXT,
    images TEXT,
    url TEXT,
    scraped_at DATETIME,
    source TEXT,
    is_favorite INTEGER DEFAULT 0 CHECK (is_favorite IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- Scraper configurations table
CREATE TABLE IF NOT EXISTS scraper_configs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    supplier_id TEXT,
    base_url TEXT,
    category TEXT,
    selectors TEXT,
    schedule TEXT CHECK (schedule IN ('manual', 'hourly', 'daily', 'weekly')),
    is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1)),
    last_run DATETIME,
    last_status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- Scraping logs table
CREATE TABLE IF NOT EXISTS scraping_logs (
    id TEXT PRIMARY KEY,
    scraper_id TEXT,
    status TEXT,
    message TEXT,
    items_scraped INTEGER DEFAULT 0,
    started_at DATETIME,
    completed_at DATETIME,
    error_details TEXT,
    FOREIGN KEY (scraper_id) REFERENCES scraper_configs(id) ON DELETE CASCADE
);

-- Comparison items table
CREATE TABLE IF NOT EXISTS comparison_items (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_scraped_at ON products(scraped_at);
CREATE INDEX IF NOT EXISTS idx_scraper_configs_supplier_id ON scraper_configs(supplier_id);
CREATE INDEX IF NOT EXISTS idx_scraping_logs_scraper_id ON scraping_logs(scraper_id);
CREATE INDEX IF NOT EXISTS idx_comparison_items_product_id ON comparison_items(product_id);

-- Triggers for auto-updating updated_at timestamp
CREATE TRIGGER IF NOT EXISTS trg_suppliers_updated_at
AFTER UPDATE ON suppliers
FOR EACH ROW
BEGIN
    UPDATE suppliers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_products_updated_at
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_scraper_configs_updated_at
AFTER UPDATE ON scraper_configs
FOR EACH ROW
BEGIN
    UPDATE scraper_configs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
