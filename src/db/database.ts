import BetterSqlite3 from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DatabaseConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

export class Database {
  private static instance: Database | null = null;
  private db: BetterSqlite3.Database | null = null;
  private dbPath: string | null = null;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  connect(dbPath: string): BetterSqlite3.Database {
    try {
      const resolvedPath = path.resolve(dbPath);
      const dbDir = path.dirname(resolvedPath);

      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new BetterSqlite3(resolvedPath);
      this.dbPath = resolvedPath;

      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');
      this.db.pragma('synchronous = NORMAL');

      return this.db;
    } catch (error) {
      throw new DatabaseConnectionError(
        `Failed to connect to database at ${dbPath}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  initializeSchema(): void {
    if (!this.db) {
      throw new DatabaseConnectionError('Database not connected. Call connect() first.');
    }

    try {
      const schemaPath = path.join(__dirname, 'schema.sql');

      if (!fs.existsSync(schemaPath)) {
        throw new DatabaseConnectionError(`Schema file not found at ${schemaPath}`);
      }

      const schema = fs.readFileSync(schemaPath, 'utf-8');
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        try {
          this.db.exec(statement + ';');
        } catch (error) {
          if (error instanceof Error && error.message.includes('already exists')) {
            continue;
          }
          throw error;
        }
      }
    } catch (error) {
      throw new DatabaseConnectionError(
        `Failed to initialize schema: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  getConnection(): BetterSqlite3.Database {
    if (!this.db) {
      throw new DatabaseConnectionError('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  isConnected(): boolean {
    return this.db !== null;
  }

  getDbPath(): string | null {
    return this.dbPath;
  }

  close(): void {
    if (this.db) {
      try {
        this.db.close();
      } catch (error) {
        console.error('Error closing database:', error);
      } finally {
        this.db = null;
        this.dbPath = null;
      }
    }
  }

  backup(backupPath: string): void {
    if (!this.db) {
      throw new DatabaseConnectionError('Database not connected. Call connect() first.');
    }

    try {
      const resolvedPath = path.resolve(backupPath);
      this.db.backup(resolvedPath);
    } catch (error) {
      throw new DatabaseConnectionError(
        `Failed to create backup: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  run(sql: string, params?: any[]): BetterSqlite3.RunResult {
    if (!this.db) {
      throw new DatabaseConnectionError('Database not connected. Call connect() first.');
    }

    try {
      const stmt = this.db.prepare(sql);
      return stmt.run(params || []);
    } catch (error) {
      throw new DatabaseConnectionError(
        `Query failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  get<T>(sql: string, params?: any[]): T | undefined {
    if (!this.db) {
      throw new DatabaseConnectionError('Database not connected. Call connect() first.');
    }

    try {
      const stmt = this.db.prepare(sql);
      return stmt.get(params || []) as T | undefined;
    } catch (error) {
      throw new DatabaseConnectionError(
        `Query failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  all<T>(sql: string, params?: any[]): T[] {
    if (!this.db) {
      throw new DatabaseConnectionError('Database not connected. Call connect() first.');
    }

    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(params || []) as T[];
    } catch (error) {
      throw new DatabaseConnectionError(
        `Query failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  transaction<T>(callback: () => T): T {
    if (!this.db) {
      throw new DatabaseConnectionError('Database not connected. Call connect() first.');
    }

    const transaction = this.db.transaction(callback);
    return transaction();
  }
}

export default Database;
