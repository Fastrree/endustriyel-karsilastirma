import Database from '../database';
import type { Supplier, ContactInfo } from '../../types';

export interface SupplierRow {
  id: string;
  name: string;
  website: string | null;
  logo: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  rating: number | null;
  reliability: number | null;
  last_scraped: string | null;
  created_at: string;
  updated_at: string;
}

export class SupplierRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  private mapRowToSupplier(row: SupplierRow): Supplier {
    const contactInfo: ContactInfo | undefined = row.contact_email || row.contact_phone || row.contact_address
      ? {
          email: row.contact_email || undefined,
          phone: row.contact_phone || undefined,
          address: row.contact_address || undefined,
        }
      : undefined;

    return {
      id: row.id,
      name: row.name,
      website: row.website || undefined,
      logo: row.logo || undefined,
      contactInfo,
      rating: row.rating || undefined,
      reliability: row.reliability || undefined,
      lastScraped: row.last_scraped ? new Date(row.last_scraped) : undefined,
    };
  }

  private serializeForDb(supplier: Partial<Supplier>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (supplier.name !== undefined) result.name = supplier.name;
    if (supplier.website !== undefined) result.website = supplier.website || null;
    if (supplier.logo !== undefined) result.logo = supplier.logo || null;
    if (supplier.contactInfo?.email !== undefined) result.contact_email = supplier.contactInfo.email || null;
    if (supplier.contactInfo?.phone !== undefined) result.contact_phone = supplier.contactInfo.phone || null;
    if (supplier.contactInfo?.address !== undefined) result.contact_address = supplier.contactInfo.address || null;
    if (supplier.rating !== undefined) result.rating = supplier.rating || null;
    if (supplier.reliability !== undefined) result.reliability = supplier.reliability || null;
    if (supplier.lastScraped !== undefined) result.last_scraped = supplier.lastScraped ? supplier.lastScraped.toISOString() : null;

    return result;
  }

  findAll(): Supplier[] {
    try {
      const sql = 'SELECT * FROM suppliers ORDER BY name ASC';
      const rows = this.db.all<SupplierRow>(sql);
      return rows.map(row => this.mapRowToSupplier(row));
    } catch (error) {
      throw new Error(`Failed to find suppliers: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  findById(id: string): Supplier | undefined {
    try {
      const sql = 'SELECT * FROM suppliers WHERE id = ?';
      const row = this.db.get<SupplierRow>(sql, [id]);
      return row ? this.mapRowToSupplier(row) : undefined;
    } catch (error) {
      throw new Error(`Failed to find supplier by id: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  create(supplier: Supplier): Supplier {
    try {
      const sql = `
        INSERT INTO suppliers (
          id, name, website, logo, contact_email, contact_phone,
          contact_address, rating, reliability, last_scraped
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        supplier.id,
        supplier.name,
        supplier.website || null,
        supplier.logo || null,
        supplier.contactInfo?.email || null,
        supplier.contactInfo?.phone || null,
        supplier.contactInfo?.address || null,
        supplier.rating || null,
        supplier.reliability || null,
        supplier.lastScraped ? supplier.lastScraped.toISOString() : null,
      ];

      this.db.run(sql, params);
      return this.findById(supplier.id)!;
    } catch (error) {
      throw new Error(`Failed to create supplier: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  update(id: string, updates: Partial<Supplier>): Supplier {
    try {
      const fields = this.serializeForDb(updates);
      const keys = Object.keys(fields);

      if (keys.length === 0) {
        throw new Error('No fields to update');
      }

      const setClause = keys.map(key => `${key} = ?`).join(', ');
      const sql = `UPDATE suppliers SET ${setClause} WHERE id = ?`;
      const params = [...Object.values(fields), id];

      const result = this.db.run(sql, params);

      if (result.changes === 0) {
        throw new Error(`Supplier with id ${id} not found`);
      }

      return this.findById(id)!;
    } catch (error) {
      throw new Error(`Failed to update supplier: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  delete(id: string): void {
    try {
      const sql = 'DELETE FROM suppliers WHERE id = ?';
      const result = this.db.run(sql, [id]);

      if (result.changes === 0) {
        throw new Error(`Supplier with id ${id} not found`);
      }
    } catch (error) {
      throw new Error(`Failed to delete supplier: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  findByName(name: string): Supplier | undefined {
    try {
      const sql = 'SELECT * FROM suppliers WHERE name = ? COLLATE NOCASE';
      const row = this.db.get<SupplierRow>(sql, [name]);
      return row ? this.mapRowToSupplier(row) : undefined;
    } catch (error) {
      throw new Error(`Failed to find supplier by name: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  updateLastScraped(id: string): Supplier {
    try {
      const sql = 'UPDATE suppliers SET last_scraped = CURRENT_TIMESTAMP WHERE id = ?';
      const result = this.db.run(sql, [id]);

      if (result.changes === 0) {
        throw new Error(`Supplier with id ${id} not found`);
      }

      return this.findById(id)!;
    } catch (error) {
      throw new Error(`Failed to update last scraped: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default SupplierRepository;
