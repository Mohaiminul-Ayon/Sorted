import * as SQLite from 'expo-sqlite';
import { APP_SCHEMA_VERSION, migrationStatements } from '../domain/migrations';
import { SCHEMA_SQL } from './schema';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function applyMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await db.execAsync(SCHEMA_SQL);
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', ['schemaVersion']);
  const fromVersion = row ? Number(row.value) : 0;
  const extra = migrationStatements(fromVersion, APP_SCHEMA_VERSION);
  for (const sql of extra) {
    await db.execAsync(sql);
  }
  await db.runAsync('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [
    'schemaVersion',
    String(APP_SCHEMA_VERSION),
  ]);
  await db.runAsync('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [
    'lastOpenedAt',
    new Date().toISOString(),
  ]);
}

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('sorted.db');
      await applyMigrations(db);
      return db;
    })().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}
