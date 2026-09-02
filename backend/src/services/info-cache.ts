import fsp from "node:fs/promises";
import path from "node:path";

const DATA_DIR = process.env.DATA_DIR ?? "./data";
const INFO_DIR = process.env.INFO_DIR ?? path.join(DATA_DIR, "info");

/**
 * Signed CDN URLs inside an info dict expire — TikTok's carry an explicit
 * `Expires`, Instagram's are similar — so cached formats are only worth
 * reusing for a short while. Past this the job re-extracts, which is what it
 * did before this cache existed. Kept well under the shortest expiry seen in
 * the wild rather than tuned to it, because guessing wrong costs a failed
 * download while re-extracting only costs a request.
 */
const MAX_AGE_MS = 30 * 60 * 1000;

export function infoPath(id: number): string {
  return path.join(INFO_DIR, `${id}.info.json`);
}

/**
 * Stores the info dict a resolve already produced so the download does not
 * have to extract the page a second time. Best effort: a cache that cannot be
 * written just means the old two-extraction path is used.
 */
export async function save(id: number, info: unknown): Promise<boolean> {
  if (!info) return false;

  try {
    await fsp.mkdir(INFO_DIR, { recursive: true });
    await fsp.writeFile(infoPath(id), JSON.stringify(info), "utf8");

    return true;
  } catch (e) {
    console.warn(`download ${id}: could not cache info json:`, e);

    return false;
  }
}

/** The cached file, or null when it is missing or too old to trust. */
export async function pathIfFresh(id: number): Promise<string | null> {
  const file = infoPath(id);

  try {
    const stat = await fsp.stat(file);

    if (Date.now() - stat.mtimeMs > MAX_AGE_MS) {
      await drop(id);

      return null;
    }

    return file;
  } catch {
    return null;
  }
}

export async function drop(id: number): Promise<void> {
  try {
    await fsp.rm(infoPath(id), { force: true });
  } catch {
    // best effort only
  }
}
