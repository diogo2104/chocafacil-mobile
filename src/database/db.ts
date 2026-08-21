import * as SQLite from 'expo-sqlite';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync('chocafacil.db');
  }
  return databasePromise;
}

export async function initDatabase(): Promise<void> {
  const db = await openDatabase();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS chickens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL CHECK(length(trim(name)) > 0),
      breed TEXT NOT NULL CHECK(breed IN ('COMUM','GSB','MESTICA','INDIA','OUTRA')),
      custom_breed TEXT,
      image_uri TEXT,
      father_name TEXT,
      mother_name TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      CHECK(breed != 'OUTRA' OR length(trim(custom_breed)) > 0)
    );

    CREATE TABLE IF NOT EXISTS hatchings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chicken_id INTEGER NOT NULL,
      eggs INTEGER NOT NULL CHECK(eggs > 0),
      start_date TEXT NOT NULL,
      expected_date TEXT NOT NULL,
      end_date TEXT,
      chicks INTEGER CHECK(chicks IS NULL OR chicks >= 0),
      status TEXT NOT NULL CHECK(status IN ('ACTIVE','COMPLETED','CANCELLED')),
      created_at TEXT NOT NULL,
      FOREIGN KEY(chicken_id) REFERENCES chickens(id) ON DELETE CASCADE
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_hatchings_one_active_per_chicken
      ON hatchings(chicken_id) WHERE status = 'ACTIVE';

    CREATE INDEX IF NOT EXISTS idx_hatchings_chicken
      ON hatchings(chicken_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS scheduled_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hatching_id INTEGER NOT NULL,
      notification_identifier TEXT NOT NULL UNIQUE,
      scheduled_at TEXT NOT NULL,
      FOREIGN KEY(hatching_id) REFERENCES hatchings(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_hatching
      ON scheduled_notifications(hatching_id);
  `);
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await openDatabase();
  await db.execAsync('PRAGMA foreign_keys = ON;');
  return db;
}
