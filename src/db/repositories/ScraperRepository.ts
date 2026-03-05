import Database from '../database';
import type { ScraperConfig, ScraperLog } from '../../types';

export interface ScraperConfigRow {
  id: string;
  name: string;
  supplier_id: string | null;
  base_url: string | null;
  category: string | null;
  selectors: string;
  schedule: 'manual' | 'hourly' | 'daily' | 'weekly';
  is_active: number;
  last_run: string | null;
  last_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScraperLogRow {
  id: string;
  scraper_id: string | null;
  status: string;
  message: string;
  items_scraped: number;
  started_at: string;
  completed_at: string | null;
  error_details: string | null;
}

export interface ScrapingLogInput {
  id: string;
  scraperId: string;
  status: 'success' | 'error' | 'running';
  message: string;
  itemsScraped: number;
  startedAt: Date;
  completedAt?: Date;
  errorDetails?: string;
}

export class ScraperRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  private mapRowToScraperConfig(row: ScraperConfigRow): ScraperConfig {
    return {
      id: row.id,
      name: row.name,
      supplierId: row.supplier_id || '',
      url: row.base_url || '',
      baseUrl: row.base_url || '',
      category: row.category || '',
      selectors: JSON.parse(row.selectors) as ScraperConfig['selectors'],
      schedule: row.schedule,
      isActive: row.is_active === 1,
      lastRun: row.last_run ? new Date(row.last_run) : undefined,
      lastStatus: row.last_status as 'success' | 'error' | 'running' | undefined,
    };
  }

  private mapRowToScraperLog(row: ScraperLogRow): ScraperLog {
    return {
      id: row.id,
      scraperId: row.scraper_id || '',
      status: row.status as 'success' | 'error' | 'running',
      message: row.message,
      itemsScraped: row.items_scraped,
      startedAt: new Date(row.started_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      errorDetails: row.error_details || undefined,
    };
  }

  private serializeConfigForDb(config: Partial<ScraperConfig>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (config.name !== undefined) result.name = config.name;
    if (config.supplierId !== undefined) result.supplier_id = config.supplierId || null;
    if (config.baseUrl !== undefined) result.base_url = config.baseUrl || null;
    if (config.category !== undefined) result.category = config.category || null;
    if (config.selectors !== undefined) result.selectors = JSON.stringify(config.selectors);
    if (config.schedule !== undefined) result.schedule = config.schedule;
    if (config.isActive !== undefined) result.is_active = config.isActive ? 1 : 0;
    if (config.lastRun !== undefined) result.last_run = config.lastRun ? config.lastRun.toISOString() : null;
    if (config.lastStatus !== undefined) result.last_status = config.lastStatus || null;

    return result;
  }

  findAll(): ScraperConfig[] {
    try {
      const sql = 'SELECT * FROM scraper_configs ORDER BY name ASC';
      const rows = this.db.all<ScraperConfigRow>(sql);
      return rows.map(row => this.mapRowToScraperConfig(row));
    } catch (error) {
      throw new Error(`Failed to find scraper configs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  findActive(): ScraperConfig[] {
    try {
      const sql = 'SELECT * FROM scraper_configs WHERE is_active = 1 ORDER BY name ASC';
      const rows = this.db.all<ScraperConfigRow>(sql);
      return rows.map(row => this.mapRowToScraperConfig(row));
    } catch (error) {
      throw new Error(`Failed to find active scraper configs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  findById(id: string): ScraperConfig | undefined {
    try {
      const sql = 'SELECT * FROM scraper_configs WHERE id = ?';
      const row = this.db.get<ScraperConfigRow>(sql, [id]);
      return row ? this.mapRowToScraperConfig(row) : undefined;
    } catch (error) {
      throw new Error(`Failed to find scraper config by id: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  create(config: ScraperConfig): ScraperConfig {
    try {
      const sql = `
        INSERT INTO scraper_configs (
          id, name, supplier_id, base_url, category, selectors,
          schedule, is_active, last_run, last_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        config.id,
        config.name,
        config.supplierId || null,
        config.baseUrl || null,
        config.category || null,
        JSON.stringify(config.selectors),
        config.schedule,
        config.isActive ? 1 : 0,
        config.lastRun ? config.lastRun.toISOString() : null,
        config.lastStatus || null,
      ];

      this.db.run(sql, params);
      return this.findById(config.id)!;
    } catch (error) {
      throw new Error(`Failed to create scraper config: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  update(id: string, updates: Partial<ScraperConfig>): ScraperConfig {
    try {
      const fields = this.serializeConfigForDb(updates);
      const keys = Object.keys(fields);

      if (keys.length === 0) {
        throw new Error('No fields to update');
      }

      const setClause = keys.map(key => `${key} = ?`).join(', ');
      const sql = `UPDATE scraper_configs SET ${setClause} WHERE id = ?`;
      const params = [...Object.values(fields), id];

      const result = this.db.run(sql, params);

      if (result.changes === 0) {
        throw new Error(`Scraper config with id ${id} not found`);
      }

      return this.findById(id)!;
    } catch (error) {
      throw new Error(`Failed to update scraper config: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  delete(id: string): void {
    try {
      const sql = 'DELETE FROM scraper_configs WHERE id = ?';
      const result = this.db.run(sql, [id]);

      if (result.changes === 0) {
        throw new Error(`Scraper config with id ${id} not found`);
      }
    } catch (error) {
      throw new Error(`Failed to delete scraper config: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  logScraping(log: ScrapingLogInput): ScraperLog {
    try {
      const sql = `
        INSERT INTO scraping_logs (
          id, scraper_id, status, message, items_scraped,
          started_at, completed_at, error_details
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        log.id,
        log.scraperId || null,
        log.status,
        log.message,
        log.itemsScraped,
        log.startedAt.toISOString(),
        log.completedAt ? log.completedAt.toISOString() : null,
        log.errorDetails || null,
      ];

      this.db.run(sql, params);

      const result = this.getLogById(log.id);
      if (!result) {
        throw new Error('Failed to retrieve created log');
      }
      return result;
    } catch (error) {
      throw new Error(`Failed to log scraping: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private getLogById(id: string): ScraperLog | undefined {
    const sql = 'SELECT * FROM scraping_logs WHERE id = ?';
    const row = this.db.get<ScraperLogRow>(sql, [id]);
    return row ? this.mapRowToScraperLog(row) : undefined;
  }

  getLogs(scraperId: string, limit?: number): ScraperLog[] {
    try {
      let sql = `
        SELECT * FROM scraping_logs 
        WHERE scraper_id = ? 
        ORDER BY started_at DESC
      `;
      const params: (string | number)[] = [scraperId];

      if (limit !== undefined) {
        sql += ' LIMIT ?';
        params.push(limit);
      }

      const rows = this.db.all<ScraperLogRow>(sql, params);
      return rows.map(row => this.mapRowToScraperLog(row));
    } catch (error) {
      throw new Error(`Failed to get scraping logs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  updateLastRun(id: string, status: string): ScraperConfig {
    try {
      const sql = `
        UPDATE scraper_configs 
        SET last_run = CURRENT_TIMESTAMP, last_status = ?
        WHERE id = ?
      `;

      const result = this.db.run(sql, [status, id]);

      if (result.changes === 0) {
        throw new Error(`Scraper config with id ${id} not found`);
      }

      return this.findById(id)!;
    } catch (error) {
      throw new Error(`Failed to update last run: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default ScraperRepository;
