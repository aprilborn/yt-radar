import { FastifyInstance } from "fastify";
import { db } from "../../db/index.js";
import { settings } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function settingsRoutes(app: FastifyInstance) {
  app.post("/api/settings/validate-metube", async (req) => {
    const { url } = req.body as { url: string };
    if (!url) return { status: false };

    try {
      const test = new URL("/add", url);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(test.toString(), {
        method: "OPTIONS",
        signal: controller.signal
      });

      clearTimeout(timeout);

      return { status: res.ok };
    } catch {
      return { status: false };
    }
  });

  app.get("/api/settings", async () => {
    const [row] = await db
      .select()
      .from(settings)
      .where(eq(settings.id, 1));

    return row;
  });

  app.post("/api/settings", async (req) => {
    const body = req.body as {
      enabled: boolean | null;
      metubeUrl: string;
      webhookUrl?: string | null;
    };

    await db
      .update(settings)
      .set({
        enabled: body.enabled ?? true,
        metubeUrl: body.metubeUrl,
        webhookUrl: body.webhookUrl ?? null,
        updatedAt: new Date().toISOString()
      })
      .where(eq(settings.id, 1));

    const [updated] = await db
      .select()
      .from(settings)
      .where(eq(settings.id, 1));

    return updated;
  });

  app.post("/api/metube", async (req) => {
    const body = req.body as {
      metubeUrl: string;
    };

    await db
      .update(settings)
      .set({
        metubeUrl: body.metubeUrl,
        updatedAt: new Date().toISOString()
      })
      .where(eq(settings.id, 1));

    const [updated] = await db
      .select()
      .from(settings)
      .where(eq(settings.id, 1));

    return updated;
  });
}