import fs from "node:fs";
import path from "node:path";

import { db } from "../db/index.js";
import { channel, settings } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

import { getLatestVideo } from "./rss.js";
import { sendToMeTube } from "./metube.js";
import { sendWebhook } from "./webhook.js";
import { withLock } from "./lock.js";
import { ImagesService } from "./images.service.js";

import type { Channel, Settings } from "../db/types.js";
import { calculateNextCheck } from "../utils/schedule.helper.js";

let workerTimer: NodeJS.Timeout | null = null;
const DATA_DIR = process.env.DATA_DIR ?? "./data";
const IMAGES_DIR = path.join(DATA_DIR, "images");

async function downloadThumbnailOnce(
  videoId: string,
  thumbnailUrl?: string | null,
  prevVideoId?: string | null
) {

  if (!thumbnailUrl) return null;

  const filename = `video-${videoId}.jpg`;

  const filePath = path.join(
    process.env.IMAGES_DIR ?? IMAGES_DIR,
    filename
  );

  if (fs.existsSync(filePath)) {
    return `/images/${filename}`;
  }

  const prevFilePath = path.join(
    process.env.IMAGES_DIR ?? IMAGES_DIR,
    `video-${prevVideoId}.jpg`
  );

  if (fs.existsSync(prevFilePath)) {
    ImagesService.remove(prevFilePath);
  }

  return await ImagesService.download(thumbnailUrl, filename);
}

export async function processChannel(
  ch: Channel,
  appSettings: Settings,
  scheduled: boolean = true
) {

  const latest = await getLatestVideo(ch.rssUrl);

  const now = new Date();
  const nowIso = now.toISOString();

  if (!latest) return;

  if (!latest?.videoId) {
    await db.update(channel)
      .set({
        lastCheckedAt: nowIso,
        nextCheckAt: scheduled ? calculateNextCheck(ch, now) : ch.nextCheckAt
      })
      .where(eq(channel.id, ch.id));
  
    return;
  }

  const isFirstScan = !ch.lastVideoId;

  if (isFirstScan) {

    const thumbnailPath = await downloadThumbnailOnce(
      latest.videoId,
      latest.thumbnail,
      ch.lastVideoId
    );

    const nextCheckAt = scheduled
      ? calculateNextCheck(ch, now)
      : ch.nextCheckAt;

    await db.update(channel)
      .set({
        lastVideoId: latest.videoId,
        lastVideoTitle: latest.title ?? null,
        lastVideoDescription: latest.description ?? null,
        lastVideoThumbnailPath: thumbnailPath,
        lastCaptureAt: nowIso,
        lastCheckedAt: nowIso,
        nextCheckAt,
      })
      .where(eq(channel.id, ch.id));

    if (ch.startFromLast) {
      await sendToMeTube({
        metubeUrl: appSettings.metubeUrl,
        videoUrl: latest.link ?? "",
        type: ch.type,
        codec: ch.codec ?? null,
        format: ch.format,
        prefix: ch.prefix ?? "",
        tag: ch.tag ?? ""
      });
    }

    return;
  }

  if (latest.videoId === ch.lastVideoId) {

    const nextCheckAt = scheduled
      ? calculateNextCheck(ch, now)
      : ch.nextCheckAt;

    await db.update(channel)
      .set({
        lastCheckedAt: nowIso,
        nextCheckAt,
      })
      .where(eq(channel.id, ch.id));

    return;
  }

  const thumbnailPath = await downloadThumbnailOnce(
    latest.videoId!,
    latest.thumbnail,
    ch.lastVideoId
  );

  await sendToMeTube({
    metubeUrl: appSettings.metubeUrl,
    videoUrl: latest.link ?? "",
    type: ch.type,
    codec: ch.codec ?? null,
    format: ch.format,
    prefix: ch.prefix ?? "",
    tag: ch.tag ?? ""
  });

  const webhookUrl =
    ch.webhookOverride || appSettings.webhookUrl;

  if (ch.notifyHA && webhookUrl) {
    await sendWebhook(webhookUrl, {
      channelId: ch.id,
      channel: ch.name,
      videoId: latest.videoId,
      title: latest.title,
      format: ch.format
    });
  }

  const nextCheckAt = scheduled
    ? calculateNextCheck(ch, now)
    : ch.nextCheckAt;

  await db.update(channel)
    .set({
      lastVideoId: latest.videoId,
      lastVideoTitle: latest.title ?? null,
      lastVideoDescription:
        latest.description?.slice(0, 2000) ?? null,
      lastVideoThumbnailPath: thumbnailPath,
      lastCaptureAt: nowIso,
      lastCheckedAt: nowIso,
      nextCheckAt,
      totalDownloads: sql`${channel.totalDownloads} + 1`
    })
    .where(eq(channel.id, ch.id));
}

async function getNextWorkerDelay(): Promise<number> {

  const row = await db.get<{ nextCheckAt: string }>(
    sql`
      SELECT nextCheckAt
      FROM channel
      WHERE enabled = 1
      AND nextCheckAt IS NOT NULL
      ORDER BY nextCheckAt ASC
      LIMIT 1
    `
  );

  if (!row) return 60_000;

  const now = Date.now();
  const target = new Date(row.nextCheckAt).getTime();

  const delay = target - now;

  if (delay <= 0) return 0;

  return Math.min(delay, 60_000);
}

export async function runWorkerTick() {

  const [appSettings] = await db
    .select()
    .from(settings)
    .where(eq(settings.id, 1));

  if (!appSettings?.enabled) return;

  const nowIso = new Date().toISOString();

  const channels = await db
    .select()
    .from(channel)
    .where(sql`
      enabled = 1
      AND nextCheckAt IS NOT NULL
      AND nextCheckAt <= ${nowIso}
    `);

  for (const ch of channels) {

    try {

      await processChannel(ch, appSettings, true);

    } catch (e) {

      console.error("Channel error:", ch.id, e);

      await db.update(channel)
        .set({
          lastCheckedAt: nowIso,
          nextCheckAt: calculateNextCheck(ch, new Date())
        })
        .where(eq(channel.id, ch.id));
    }
  }
}

async function workerLoop() {

  await withLock(async () => {
    await runWorkerTick();
  });

  const delay = await getNextWorkerDelay();

  workerTimer = setTimeout(workerLoop, delay);
}

export function startWorker() {

  if (workerTimer) return;

  workerLoop().catch(console.error);
}

export async function runChannelOnce(channelId: number) {

  const [appSettings] = await db
    .select()
    .from(settings)
    .where(eq(settings.id, 1));

  if (!appSettings?.enabled) return;

  const [ch] = await db
    .select()
    .from(channel)
    .where(eq(channel.id, channelId));

  if (!ch) return;

  await processChannel(ch, appSettings, false);
}