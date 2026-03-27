import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { settings } from "../../db/schema.js";
import { broadcast } from "./websockets.js";

let pollTimer: NodeJS.Timeout | null = null;
let lastStatus: boolean | null = null;
let pollingEnabled = false;

export function startMetubeStatusPolling() {
  if (pollingEnabled) return;

  pollingEnabled = true;
  void pollMetubeStatus();
}

export function stopMetubeStatusPolling() {
  pollingEnabled = false;

  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }

  lastStatus = null;
}

async function pollMetubeStatus() {
  if (!pollingEnabled) return;

  lastStatus = await checkMetubeStatus(lastStatus);

  if (!pollingEnabled) return;

  pollTimer = setTimeout(() => void pollMetubeStatus(), 3000);
}

async function checkMetubeStatus(lastStatus: boolean | null): Promise<boolean | null> {
  try {
    const [row] = await db
      .select()
      .from(settings)
      .where(eq(settings.id, 1));

    const res = await fetch(row.metubeUrl);

    if (lastStatus !== res.ok) {
      lastStatus = res.ok;
      broadcast('metube-status', { status: res.ok });
    }
  } catch {
    if (lastStatus) {
      lastStatus = false;
      broadcast('metube-status', { status: false });
    }
  }

  return lastStatus;
}