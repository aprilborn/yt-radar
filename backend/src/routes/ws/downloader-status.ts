import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { settings } from "../../db/schema.js";
import { broadcast } from "./websockets.js";
import * as ytdlp from "../../services/ytdlp.js";

export type DownloaderStatus = {
  downloader: "ytdlp";
  status: boolean;
  detail: string | null;
};

const POLL_INTERVAL_MS = 3000;

let pollTimer: NodeJS.Timeout | null = null;
let lastStatus: DownloaderStatus | null = null;
let pollingEnabled = false;

export function startDownloaderStatusPolling() {
  if (pollingEnabled) return;

  pollingEnabled = true;
  void pollDownloaderStatus();
}

export function stopDownloaderStatusPolling() {
  pollingEnabled = false;

  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }

  lastStatus = null;
}

async function pollDownloaderStatus() {
  if (!pollingEnabled) return;

  const next = await checkDownloaderStatus();

  if (!isSame(lastStatus, next)) {
    lastStatus = next;
    broadcast("downloader-status", next);
  }

  if (!pollingEnabled) return;

  pollTimer = setTimeout(() => void pollDownloaderStatus(), POLL_INTERVAL_MS);
}

function isSame(a: DownloaderStatus | null, b: DownloaderStatus): boolean {
  return (
    a?.downloader === b.downloader &&
    a?.status === b.status &&
    a?.detail === b.detail
  );
}

export async function checkDownloaderStatus(): Promise<DownloaderStatus> {
  const [row] = await db.select().from(settings).where(eq(settings.id, 1));

  if (!row) {
    return { downloader: "ytdlp", status: false, detail: null };
  }

  const health = await ytdlp.checkHealth(row);

  return {
    downloader: "ytdlp",
    status: health.ok,
    // checkHealth also reports non-fatal problems — a broken ffmpeg leaves
    // yt-dlp itself usable — so a message wins over the version even when
    // the status is good.
    detail: health.error ?? health.version
  };
}
