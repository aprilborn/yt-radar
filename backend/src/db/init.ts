import { sql } from "drizzle-orm";
import { db } from "./index.js";

export function initSchema() {
  db.run(sql`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      enabled INTEGER NOT NULL DEFAULT 1,
      metubeUrl TEXT NOT NULL,
      webhookUrl TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.run(sql`
    CREATE TABLE IF NOT EXISTS channel (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      channelId  TEXT,
      channelDescription  TEXT,
      channelAvatarPath  TEXT,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      color TEXT DEFAULT '#ffffff',
      rssUrl TEXT NOT NULL,
      format TEXT NOT NULL DEFAULT 'mp4',
      enabled INTEGER NOT NULL DEFAULT 1,
      startFromLast INTEGER NOT NULL DEFAULT 1,
      downloadShorts INTEGER NOT NULL DEFAULT 0,
      notifyHA INTEGER NOT NULL DEFAULT 0,
      pollType TEXT NOT NULL DEFAULT 'interval',
      pollInterval INTEGER,
      pollTime TEXT,
      prefix TEXT,
      tag TEXT,
      webhookOverride TEXT,
      lastVideoTitle  TEXT,
      lastVideoDescription  TEXT,
      lastVideoThumbnailPath  TEXT,
      lastVideoId TEXT,
      lastCheckedAt TEXT,
      nextCheckAt TEXT,
      lastCaptureAt  TEXT,
      totalDownloads INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  db.run(sql `
    CREATE INDEX IF NOT EXISTS idx_channel_enabled_nextCheckAt
    ON channel (enabled, nextCheckAt);
  `);
}