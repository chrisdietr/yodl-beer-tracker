import Database from 'better-sqlite3';
import * as schema from "@shared/schema";
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { SQLiteAsyncDialect, SQLiteSyncDialect } from "drizzle-orm/sqlite-core";

// Create SQLite database connection
const sqlite = new Database('beer_tracker.db');

// Set up Drizzle with our SQLite database
export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS drinkers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    initial TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS beer_consumptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drinker_id INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    memo TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    total_beers INTEGER NOT NULL,
    current_pace INTEGER NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS app_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS brz_token_holders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    initial TEXT NOT NULL,
    amount INTEGER NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

export default db;