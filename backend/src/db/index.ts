import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = process.env.DATA_DIR ?? "./data";
const dbPath = path.join(dataDir, "app.db");

const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

/**
 * SQLite's own `lower()` and its case-insensitive `LIKE` only fold ASCII: to
 * the built-ins "ВИДЕО" and "видео" are different strings, so a title search
 * would silently miss every Cyrillic result. JS `toLowerCase()` folds the
 * whole of Unicode, and registering it here lets a query lower both sides of
 * a comparison with the same operation the caller used to build its pattern.
 *
 * Deterministic so SQLite is free to cache the result within a statement.
 */
sqlite.function("lower_u", { deterministic: true }, (value: unknown) =>
  typeof value === "string" ? value.toLowerCase() : null
);

export const db = drizzle(sqlite);