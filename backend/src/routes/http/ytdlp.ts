import { FastifyInstance } from "fastify";
import * as ytdlp from "../../services/ytdlp.js";
import * as Ffmpeg from "../../services/ffmpeg.js";
import { checkDownloaderStatus } from "../ws/downloader-status.js";
import { broadcast } from "../ws/websockets.js";

export async function ytdlpRoutes(app: FastifyInstance) {
  app.get("/api/ytdlp/version", async () => {
    const version = await ytdlp.getVersion();

    return { version, available: !!version };
  });

  app.get("/api/ytdlp/pot", async () => ytdlp.potStatus());

  app.post("/api/ytdlp/update", async () => {
    const result = await ytdlp.update();

    // The obvious moment to look again: someone attending to the downloader
    // is also the someone who just replaced a broken ffmpeg.
    await Ffmpeg.refresh();

    broadcast("downloader-status", await checkDownloaderStatus());

    return result;
  });
}
