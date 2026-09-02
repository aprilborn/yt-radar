import { eq } from "drizzle-orm";
import { FastifyInstance } from "fastify";
import { db } from "../../db/index.js";
import { uiConfig } from "../../db/schema.js";
import {
  BG_TYPES,
  DEFAULT_UI_CONFIG,
  THEME_COLORS,
  UiConfigPayload
} from "../../models/ui-config.model.js";

type UiConfigBody = Partial<Record<keyof UiConfigPayload, unknown>>;

/**
 * Reads the singleton row, falling back to the defaults rather than returning
 * nothing. initSchema seeds the row, so this only matters if someone deletes it
 * by hand - but a missing row should still leave the UI with a theme to render.
 */
async function readConfig() {
  const [row] = await db.select().from(uiConfig).where(eq(uiConfig.id, 1));

  return row ?? { id: 1, ...DEFAULT_UI_CONFIG, createdAt: null, updatedAt: null };
}

export async function uiConfigRoutes(app: FastifyInstance) {
  app.get("/api/ui-config", async () => await readConfig());

  /**
   * Partial update: anything the body leaves out keeps its stored value, so the
   * theme dialog can send a single changed control without having to round-trip
   * the whole object first.
   *
   * Unknown enum values are rejected rather than coerced to a default. Silently
   * storing something the frontend cannot render would leave the UI on the base
   * theme with no clue why, which is far harder to debug than a 400.
   */
  app.post("/api/ui-config", async (req, reply) => {
    const body = (req.body ?? {}) as UiConfigBody;
    const current = await readConfig();

    const patch: Partial<UiConfigPayload> = {};

    if (body.sectionsBg !== undefined) {
      if (!BG_TYPES.includes(body.sectionsBg as never)) {
        return reply.code(400).send({
          error: `sectionsBg must be one of: ${BG_TYPES.join(", ")}`
        });
      }
      patch.sectionsBg = body.sectionsBg as UiConfigPayload["sectionsBg"];
    }

    if (body.themeColor !== undefined) {
      if (!THEME_COLORS.includes(body.themeColor as never)) {
        return reply.code(400).send({
          error: `themeColor must be one of: ${THEME_COLORS.join(", ")}`
        });
      }
      patch.themeColor = body.themeColor as UiConfigPayload["themeColor"];
    }

    if (body.enableAnimations !== undefined) {
      if (typeof body.enableAnimations !== "boolean") {
        return reply.code(400).send({ error: "enableAnimations must be a boolean" });
      }
      patch.enableAnimations = body.enableAnimations;
    }

    if (body.autoPaste !== undefined) {
      if (typeof body.autoPaste !== "boolean") {
        return reply.code(400).send({ error: "autoPaste must be a boolean" });
      }
      patch.autoPaste = body.autoPaste;
    }

    // Upsert rather than update, so a deleted row is recreated instead of the
    // write silently affecting nothing and the response reporting old values.
    await db
      .insert(uiConfig)
      .values({
        id: 1,
        sectionsBg: current.sectionsBg,
        themeColor: current.themeColor,
        enableAnimations: current.enableAnimations,
        autoPaste: current.autoPaste,
        ...patch,
        updatedAt: new Date().toISOString()
      })
      .onConflictDoUpdate({
        target: uiConfig.id,
        set: { ...patch, updatedAt: new Date().toISOString() }
      });

    return await readConfig();
  });
}
