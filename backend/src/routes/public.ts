import { sql } from "drizzle-orm";
import { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { channel } from "../db/schema.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/api/public/status", async () => {
    return { ok: true };
  });

  app.get("/api/public/last-video", async () => {
    const [row] = await db.select()
      .from(channel)
      .where(sql`lastCaptureAt IS NOT NULL`)
      .orderBy(sql`datetime(lastCaptureAt) DESC`)
      .limit(1);

    if (!row) {
      return { ok: false, message: "No captured videos yet." };
    }

    return {
      ok: true,
      video: {
        id: row.lastVideoId,
        title: row.lastVideoTitle,
        description: row.lastVideoDescription,
        thumbnail: row.lastVideoThumbnailPath,
        capturedAt: row.lastCaptureAt
      },
      channel: {
        id: row.id,
        name: row.name,
        channelId: row.channelId,
        avatar: row.channelAvatarPath,
        rssUrl: row.rssUrl
      }
    };
  });

  app.get("/api/public/next-check", async () => {
    const [row] = await db.select()
      .from(channel)
      .where(sql`nextCheckAt IS NOT NULL AND enabled = 1`)
      .orderBy(sql`datetime(nextCheckAt) ASC`)
      .limit(1);

    if (!row) {
      return { ok: false, message: "No upcoming checks scheduled." };
    }

    return {
      ok: true,
      nextCheckAt: row.nextCheckAt,
      channel: {
        id: row.id,
        name: row.name
      }
    };
  });

  
}