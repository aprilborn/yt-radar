import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey().default(1),

  enabled: integer("enabled", { mode: "boolean" })
    .notNull()
    .default(true),

  metubeUrl: text("metubeUrl").notNull(),
  webhookUrl: text("webhookUrl"),

  createdAt: text("createdAt")
    .notNull()
    .default(sql`(datetime('now'))`),

  updatedAt: text("updatedAt")
    .notNull()
    .default(sql`(datetime('now'))`)
});

export const channelGroup = sqliteTable("channel_group", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  sortOrder: integer("sortOrder").notNull().default(0),
  color: text("color").default("#ffffff"),
  icon: text("icon"),

  createdAt: text("createdAt")
    .notNull()
    .default(sql`(datetime('now'))`),

  updatedAt: text("updatedAt")
    .notNull()
    .default(sql`(datetime('now'))`)
});

export const channel = sqliteTable("channel", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  groupId: integer("groupId").references(() => channelGroup.id, { onDelete: "set null" }),
  name: text("name"),
  channelId: text("channelId"),
  channelDescription: text("channelDescription"),
  channelAvatarPath: text("channelAvatarPath"),
  sortOrder: integer("sortOrder").notNull().default(0),
  color: text("color"),
  rssUrl: text("rssUrl").notNull(),

  format: text("format").notNull().default("mp4"),

  enabled: integer("enabled", { mode: "boolean" })
    .notNull()
    .default(true),

  startFromLast: integer("startFromLast", { mode: "boolean" })
    .notNull()
    .default(true),

  downloadShorts: integer("downloadShorts", { mode: "boolean" })
    .notNull()
    .default(false),

  notifyHA: integer("notifyHA", { mode: "boolean" })
    .notNull()
    .default(false),

  pollType: text("pollType").notNull().default("interval"),
  pollInterval: integer("pollInterval"),
  pollTime: text("pollTime"),

  prefix: text("prefix"),
  tag: text("tag"),
  webhookOverride: text("webhookOverride"),

  lastVideoId: text("lastVideoId"),
  lastVideoTitle: text("lastVideoTitle"),
  lastVideoDescription: text("lastVideoDescription"),
  lastVideoThumbnailPath: text("lastVideoThumbnailPath"),
  lastCheckedAt: text("lastCheckedAt"),
  nextCheckAt: text("nextCheckAt"),
  lastCaptureAt: text("lastCaptureAt"),

  totalDownloads: integer("totalDownloads")
    .notNull()
    .default(0),

  createdAt: text("createdAt")
    .notNull()
    .default(sql`(datetime('now'))`),

  updatedAt: text("updatedAt")
    .notNull()
    .default(sql`(datetime('now'))`)
});