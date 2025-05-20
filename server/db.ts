import Database from 'better-sqlite3';
import * as schema from "@shared/schema";
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

// Create SQLite database connection
const sqlite = new Database('beer_tracker.db');

// Set up Drizzle with our SQLite database
export const db = drizzle(sqlite, { schema });

// Run migrations (this ensures tables exist with our schema)
// migrate(db, { migrationsFolder: './drizzle' });

export default db;