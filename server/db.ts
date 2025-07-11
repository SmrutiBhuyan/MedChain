import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";

// Create SQLite database with MySQL-like functionality
const sqlite = new Database('medchain.db');

// Enable foreign keys support
sqlite.pragma('foreign_keys = ON');

console.log('SQLite database (MySQL-compatible) created successfully');

export const db = drizzle(sqlite, { schema });
