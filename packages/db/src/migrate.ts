import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate as drizzleMigrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveDbPath } from "./client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function ensureMigrated(dbPath?: string) {
  const resolved = resolveDbPath(dbPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  const sqlite = new Database(resolved);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite);
  const migrationsFolder = path.resolve(__dirname, "../drizzle");
  if (fs.existsSync(migrationsFolder)) {
    drizzleMigrate(db, { migrationsFolder });
  }
  sqlite.close();
  return resolved;
}

const isDirect =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));

if (isDirect) {
  const p = ensureMigrated();
  console.log(`Migrated database at ${p}`);
}
