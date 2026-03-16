import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import staticPlugin from "@fastify/static";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { initSchema } from "./db/init.js";
import { db } from "./db/index.js";
import { settings } from "./db/schema.js";
import { startWorker } from "./services/worker.js";
import { eq } from "drizzle-orm";

import { healthRoutes } from "./routes/public.js";
import { settingsRoutes } from "./routes/settings.js";
import { channelsRoutes } from "./routes/channels.js";
import { actionsRoutes } from "./routes/actions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT ?? 8000);
const HOST = process.env.HOST ?? "0.0.0.0";
const WEB_ROOT = path.resolve(
  process.env.WEB_ROOT ?? path.join(__dirname, "../public")
);

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(healthRoutes);
await app.register(settingsRoutes);
await app.register(channelsRoutes);
await app.register(actionsRoutes);

initSchema();

// ensure default settings
const existing = await db
  .select()
  .from(settings)
  .where(eq(settings.id, 1));

if (!existing.length) {
  await db.insert(settings).values({
    id: 1,
    metubeUrl: "",
    enabled: false
  });
}

await app.register(staticPlugin, {
  root: WEB_ROOT,
  prefix: "/",
  wildcard: false,
  preCompressed: true,
  maxAge: "1y",
  immutable: true
});

await app.register(staticPlugin, {
  root: path.resolve("./data/images"),
  prefix: "/images/",
  decorateReply: false,
});

app.setNotFoundHandler((req, reply) => {
  if (req.raw.url?.startsWith("/api")) {
    return reply.code(404).send({ error: "Not found" });
  }

  if (req.raw.url?.includes(".")) {
    return reply.code(404).send();
  }

  return reply.sendFile("index.html");
});

startWorker();

await app.listen({ port: PORT, host: HOST });