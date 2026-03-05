import Database from '../database';
import type { Product, ProductSpecification, Supplier } from '../../types';

export interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  sku: string | null;
  brand: string | null;
  supplier_id: string;
  price: number;
  currency: string;
  unit: string;
  min_order_quantity: number | null;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  specifications: string;
  images: string | null;
  url: string | null;
  scraped_at: string;
  source: string;
  is_favorite: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFindOptions {
  category?: string;
  supplierId?: string;
  limit?: number;
  offset?: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export class ProductRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  private mapRowToProduct(row: ProductRow & {
    supplier_name?: string;
    supplier_website?: string;
    supplier_logo?: string | null;
    supplier_contact_email?: string | null;
    supplier_contact_phone?: string | null;
    supplier_contact_address?: string | null;
    supplier_rating?: number | null;
    supplier_reliability?: number | null;
    supplier_last_scraped?: string | null;
  }): Product {
    const supplier: Supplier = {
      id: row.supplier_id,
      name: row.supplier_name || '',
      website: row.supplier_website || undefined,
      logo: row.supplier_logo || undefined,
      contactInfo: {
        email: row.supplier_contact_email || undefined,
        phone: row.supplier_contact_phone || undefined,
        address: row.supplier_contact_address || undefined,
      },
      rating: row.supplier_rating || undefined,
      reliability: row.supplier_reliability || undefined,
      lastScraped: row.supplier_last_scraped ? new Date(row.supplier_last_scraped) : undefined,
    };

    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      category: row.category,
      subcategory: row.subcategory || undefined,
      sku: row.sku || undefined,
      brand: row.brand || undefined,
      supplier,
      price: row.price,
      currency: row.currency,
      unit: row.unit,
      minOrderQuantity: row.min_order_quantity || undefined,
      stockStatus: row.stock_status,
      specifications: JSON.parse(row.specifications || '[]') as ProductSpecification[],
      images: row.images ? JSON.parse(row.images) as string[] : undefined,
      url: row.url || undefined,
      lastUpdated: new Date(row.updated_at),
      isFavorite: row.is_favorite === 1,
      scrapedAt: new Date(row.scraped_at),
      source: row.source,
    };
  }

  private serializeForDb(product: Partial<Product>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (product.name !== undefined) result.name = product.name;
    if (product.description !== undefined) result.description = product.description;
    if (product.category !== undefined) result.category = product.category;
    if (product.subcategory !== undefined) result.subcategory = product.subcategory;
    if (product.sku !== undefined) result.sku = product.sku;
    if (product.brand !== undefined) result.brand = product.brand;
    if (product.supplier?.id !== undefined) result.supplier_id = product.supplier.id;
    if (product.price !== undefined) result.price = product.price;
    if (product.currency !== undefined) result.currency = product.currency;
    if (product.unit !== undefined) result.unit = product.unit;
    if (product.minOrderQuantity !== undefined) result.min_order_quantity = product.minOrderQuantity;
    if (product.stockStatus !== undefined) result.stock_status = product.stockStatus;
    if (product.specifications !== undefined) result.specifications = JSON.stringify(product.specifications);
    if (product.images !== undefined) result.images = product.images ? JSON.stringify(product.images) : null;
    if (product.url !== undefined) result.url = product.url;
    if (product.scrapedAt !== undefined) result.scraped_at = product.scrapedAt.toISOString();
    if (product.source !== undefined) result.source = product.source;
    if (product.isFavorite !== undefined) result.is_favorite = product.isFavorite ? 1 : 0;

    return result;
  }

  findAll(options?: ProductFindOptions): Product[] {
    try {
      let sql = `
        SELECT 
          p.*,
          s.name as supplier_name,
          s.website as supplier_website,
          s.logo as supplier_logo,
          s.contact_email as supplier_contact_email,
          s.contact_phone as supplier_contact_phone,
          s.contact_address as supplier_contact_address,
          s.rating as supplier_rating,
          s.reliability as supplier_reliability,
          s.last_scraped as supplier_last_scraped
        FROM products p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE 1=1
      `;
      const params: (string | number)[] = [];

      if (options?.category) {
        sql += ' AND p.category = ?';
        params.push(options.category);
      }

      if (options?.supplierId) {
        sql += ' AND p.supplier_id = ?';
        params.push(options.supplierId);
      }

      sql += ' ORDER BY p.created_at DESC';

      if (options?.limit !== undefined) {
        sql += ' LIMIT ?';
        params.push(options.limit);
      }

      if (options?.offset !== undefined) {
        sql += ' OFFSET ?';
        params.push(options.offset);
      }

      const rows = this.db.all<ProductRow & { [key: string]: unknown }>(sql, params);
      return rows.map(row => this.mapRowToProduct(row));
    } catch (error) {
      throw new Error(`Failed to find products: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  findById(id: string): Product | undefined {
    try {
      const sql = `
        SELECT 
          p.*,
          s.name as supplier_name,
          s.website as supplier_website,
          s.logo as supplier_logo,
          s.contact_email as supplier_contact_email,
          s.contact_phone as supplier_contact_phone,
          s.contact_address as supplier_contact_address,
          s.rating as supplier_rating,
          s.reliability as supplier_reliability,
          s.last_scraped as supplier_last_scraped
        FROM products p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.id = ?
      `;

      const row = this.db.get<ProductRow & { [key: string]: unknown }>(sql, [id]);
      return row ? this.mapRowToProduct(row) : undefined;
    } catch (error) {
      throw new Error(`Failed to find product by id: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  findByCategory(category: string): Product[] {
    try {
      const sql = `
        SELECT 
          p.*,
          s.name as supplier_name,
          s.website as supplier_website,
          s.logo as supplier_logo,
          s.contact_email as supplier_contact_email,
          s.contact_phone as supplier_contact_phone,
          s.contact_address as supplier_contact_address,
          s.rating as supplier_rating,
          s.reliability as supplier_reliability,
          s.last_scraped as supplier_last_scraped
        FROM products p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.category = ?
        ORDER BY p.name ASC
      `;

      const rows = this.db.all<ProductRow & { [key: string]: unknown }>(sql, [category]);
      return rows.map(row => this.mapRowToProduct(row));
    } catch (error) {
      throw new Error(`Failed to find products by category: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  findBySupplier(supplierId: string): Product[] {
    try {
      const sql = `
        SELECT 
          p.*,
          s.name as supplier_name,
          s.website as supplier_website,
          s.logo as supplier_logo,
          s.contact_email as supplier_contact_email,
          s.contact_phone as supplier_contact_phone,
          s.contact_address as supplier_contact_address,
          s.rating as supplier_rating,
          s.reliability as supplier_reliability,
          s.last_scraped as supplier_last_scraped
        FROM products p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.supplier_id = ?
        ORDER BY p.name ASC
      `;

      const rows = this.db.all<ProductRow & { [key: string]: unknown }>(sql, [supplierId]);
      return rows.map(row => this.mapRowToProduct(row));
    } catch (error) {
      throw new Error(`Failed to find products by supplier: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  create(product: Product): Product {
    try {
      const sql = `
        INSERT INTO products (
          id, name, description, category, subcategory, sku, brand,
          supplier_id, price, currency, unit, min_order_quantity,
          stock_status, specifications, images, url, scraped_at,
          source, is_favorite
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        product.id,
        product.name,
        product.description || null,
        product.category,
        product.subcategory || null,
        product.sku || null,
        product.brand || null,
        product.supplier.id,
        product.price,
        product.currency,
        product.unit,
        product.minOrderQuantity || null,
        product.stockStatus,
        JSON.stringify(product.specifications),
        product.images ? JSON.stringify(product.images) : null,
        product.url || null,
        product.scrapedAt.toISOString(),
        product.source,
        product.isFavorite ? 1 : 0,
      ];

      this.db.run(sql, params);
      return this.findById(product.id)!;
    } catch (error) {
      throw new Error(`Failed to create product: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  update(id: string, updates: Partial<Product>): Product {
    try {
      const fields = this.serializeForDb(updates);
      const keys = Object.keys(fields);

      if (keys.length === 0) {
        throw new Error('No fields to update');
      }

      const setClause = keys.map(key => `${key} = ?`).join(', ');
      const sql = `UPDATE products SET ${setClause} WHERE id = ?`;
      const params = [...Object.values(fields), id];

      const result = this.db.run(sql, params);

      if (result.changes === 0) {
        throw new Error(`Product with id ${id} not found`);
      }

      return this.findById(id)!;
    } catch (error) {
      throw new Error(`Failed to update product: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  delete(id: string): void {
    try {
      const sql = 'DELETE FROM products WHERE id = ?';
      const result = this.db.run(sql, [id]);

      if (result.changes === 0) {
        throw new Error(`Product with id ${id} not found`);
      }
    } catch (error) {
      throw new Error(`Failed to delete product: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  search(query: string): Product[] {
    try {
      const searchTerm = `%${query}%`;
      const sql = `
        SELECT 
          p.*,
          s.name as supplier_name,
          s.website as supplier_website,
          s.logo as supplier_logo,
          s.contact_email as supplier_contact_email,
          s.contact_phone as supplier_contact_phone,
          s.contact_address as supplier_contact_address,
          s.rating as supplier_rating,
          s.reliability as supplier_reliability,
          s.last_scraped as supplier_last_scraped
        FROM products p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.name LIKE ? 
          OR p.description LIKE ? 
          OR p.category LIKE ?
          OR p.brand LIKE ?
          OR p.sku LIKE ?
        ORDER BY p.name ASC
      `;

      const rows = this.db.all<ProductRow & { [key: string]: unknown }>(sql, [
        searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
      ]);
      return rows.map(row => this.mapRowToProduct(row));
    } catch (error) {
      throw new Error(`Failed to search products: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getFavorites(): Product[] {
    try {
      const sql = `
        SELECT 
          p.*,
          s.name as supplier_name,
          s.website as supplier_website,
          s.logo as supplier_logo,
          s.contact_email as supplier_contact_email,
          s.contact_phone as supplier_contact_phone,
          s.contact_address as supplier_contact_address,
          s.rating as supplier_rating,
          s.reliability as supplier_reliability,
          s.last_scraped as supplier_last_scraped
        FROM products p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.is_favorite = 1
        ORDER BY p.updated_at DESC
      `;

      const rows = this.db.all<ProductRow & { [key: string]: unknown }>(sql);
      return rows.map(row => this.mapRowToProduct(row));
    } catch (error) {
      throw new Error(`Failed to get favorites: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  toggleFavorite(id: string): Product {
    try {
      const sql = `
        UPDATE products 
        SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END
        WHERE id = ?
      `;

      const result = this.db.run(sql, [id]);

      if (result.changes === 0) {
        throw new Error(`Product with id ${id} not found`);
      }

      return this.findById(id)!;
    } catch (error) {
      throw new Error(`Failed to toggle favorite: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getPriceRange(): PriceRange {
    try {
      const sql = 'SELECT MIN(price) as min, MAX(price) as max FROM products';
      const result = this.db.get<{ min: number | null; max: number | null }>(sql);

      return {
        min: result?.min || 0,
        max: result?.max || 0,
      };
    } catch (error) {
      throw new Error(`Failed to get price range: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getCategories(): string[] {
    try {
      const sql = 'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category ASC';
      const rows = this.db.all<{ category: string }>(sql);
      return rows.map(row => row.category);
    } catch (error) {
      throw new Error(`Failed to get categories: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  bulkCreate(products: Product[]): Product[] {
    try {
      const created: Product[] = [];
      for (const product of products) {
        created.push(this.create(product));
      }
      return created;
    } catch (error) {
      throw new Error(`Failed to bulk create products: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  deleteOldData(days: number): number {
    try {
      const sql = `
        DELETE FROM products 
        WHERE scraped_at < datetime('now', '-' || ? || ' days')
      `;

      const result = this.db.run(sql, [days]);
      return result.changes;
    } catch (error) {
      throw new Error(`Failed to delete old data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default ProductRepository;
