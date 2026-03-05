import Database from './database.js';

interface Migration {
  version: number;
  name: string;
  up: string;
  down?: string;
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: `
      CREATE TABLE IF NOT EXISTS _migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
];

export async function migrate(targetVersion?: number): Promise<void> {
  const db = Database.getInstance();

  // Ensure migrations table exists
  db.run(MIGRATIONS[0].up);

  // Get current version
  const result = db.get<{ version: number }>(
    'SELECT MAX(version) as version FROM _migrations'
  );
  const currentVersion = result?.version || 0;

  // Determine target version
  const target = targetVersion || MIGRATIONS[MIGRATIONS.length - 1].version;

  if (currentVersion === target) {
    console.log(`Database is at version ${currentVersion}`);
    return;
  }

  if (currentVersion < target) {
    // Migrate up
    for (const migration of MIGRATIONS) {
      if (migration.version > currentVersion && migration.version <= target) {
        console.log(`Applying migration ${migration.version}: ${migration.name}`);
        db.transaction(() => {
          db.run(migration.up);
          db.run(
            'INSERT INTO _migrations (version, name) VALUES (?, ?)',
            [migration.version, migration.name]
          );
        });
      }
    }
  }

  console.log(`Migrated from ${currentVersion} to ${target}`);
}

export function getStatus(): { current: number; latest: number; pending: number } {
  const db = Database.getInstance();

  try {
    const result = db.get<{ version: number }>(
      'SELECT MAX(version) as version FROM _migrations'
    );
    const current = result?.version || 0;
    const latest = MIGRATIONS[MIGRATIONS.length - 1].version;

    return {
      current,
      latest,
      pending: latest - current,
    };
  } catch {
    return {
      current: 0,
      latest: MIGRATIONS[MIGRATIONS.length - 1].version,
      pending: MIGRATIONS.length - 1,
    };
  }
}
