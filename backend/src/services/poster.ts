import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

import * as Ffmpeg from "./ffmpeg.js";
import { ImagesService } from "./images.service.js";

/**
 * A poster for downloads that arrive without one.
 *
 * Most sites hand yt-dlp a thumbnail URL and the artwork cache fetches it —
 * see manual-download.ts. A bare manifest (`.../master.m3u8`) has no such
 * metadata: the generic extractor knows the stream and nothing else, so those
 * rows render the "Poster not found" placeholder forever. The video itself is
 * the only picture available, so take a frame out of it.
 *
 * ffmpeg can read the manifest directly, without downloading anything, but
 * that is exactly the path services/ffmpeg.ts exists to distrust — a
 * statically linked build segfaults the moment it resolves a hostname. A file
 * that already landed never touches the resolver, so the capture waits for
 * the download to finish and reads from disk.
 */

/** Poster width; height follows the source aspect (`-2` keeps it even). */
const WIDTH = 640;

/**
 * Openings are frequently black or a fade-in, so seek in before grabbing.
 * A share of the runtime rather than a constant, so a 20-second clip is not
 * asked for a frame it does not have — capped, because 10% of a three-hour
 * stream is half an hour of seeking for no benefit.
 */
const SEEK_FRACTION = 0.1;
const SEEK_CAP_S = 30;

/** Used when the row never learned its duration (live streams). */
const SEEK_FALLBACK_S = 10;

const TIMEOUT_MS = 30_000;

/**
 * Below this the JPEG is not a picture. ffmpeg exits 0 after writing an empty
 * file when the seek lands past the last frame, which is the case the retry
 * at offset zero is there to rescue.
 */
const MIN_BYTES = 1024;

export type CaptureRequest = {
  /** Download row id; the poster is named after it. */
  id: number;
  /** The finished media file, as reported by yt-dlp. */
  filePath: string;
  /** Seconds, when known. */
  duration: number | null;
};

export function posterName(id: number): string {
  return `poster-${id}.jpg`;
}

/**
 * Writes `/images/poster-<id>.jpg` and returns its public path, or null when
 * no frame could be read. Never throws: a missing poster is cosmetic, and the
 * download it belongs to has already succeeded.
 */
export async function capture(req: CaptureRequest): Promise<string | null> {
  try {
    if (!isReadableFile(req.filePath)) return null;

    const bin = await binary();

    if (!bin) return null;

    const filename = posterName(req.id);
    const target = ImagesService.pathFor(filename);

    // The seek is a guess about where a representative frame lives, so a miss
    // is expected rather than exceptional: fall back to the first frame,
    // which every file that decodes at all can produce.
    const offsets = [seekFor(req.duration), 0];

    for (const offset of offsets) {
      if (await frame(bin, req.filePath, offset, target)) {
        return `/images/${filename}`;
      }
    }

    // Nothing usable was written; leave no empty file behind for the static
    // route to serve as a broken image.
    discard(target);

    return null;
  } catch (e) {
    console.warn("Poster capture failed:", e);
    return null;
  }
}

/** Drops the poster for a download, if it has one. */
export function remove(id: number): void {
  void ImagesService.remove(posterName(id));
}

function seekFor(duration: number | null): number {
  if (!duration || !Number.isFinite(duration) || duration <= 0) {
    return SEEK_FALLBACK_S;
  }

  return Math.min(duration * SEEK_FRACTION, SEEK_CAP_S);
}

/**
 * The probed ffmpeg rather than whatever PATH offers first, matching how
 * ytdlp.ts passes --ffmpeg-location. A null location means the probe found
 * nothing better, so fall back to PATH and let the spawn fail if it must.
 */
async function binary(): Promise<string | null> {
  const status = Ffmpeg.known() ?? (await Ffmpeg.status());

  return status.location ? path.join(status.location, "ffmpeg") : "ffmpeg";
}

/**
 * Decodes a single frame at `offset` into `target`. `-ss` goes before `-i` so
 * ffmpeg seeks by keyframe instead of decoding everything up to that point —
 * the difference between milliseconds and minutes on a long file.
 */
function frame(
  bin: string,
  source: string,
  offset: number,
  target: string
): Promise<boolean> {
  const args = [
    "-hide_banner",
    "-loglevel", "error",
    "-nostdin",
    "-ss", offset.toFixed(3),
    "-i", source,
    "-frames:v", "1",
    "-vf", `scale=${WIDTH}:-2`,
    "-q:v", "3",
    "-y", target
  ];

  return new Promise((resolve) => {
    let child: ReturnType<typeof spawn>;

    try {
      child = spawn(bin, args, { stdio: "ignore" });
    } catch {
      resolve(false);
      return;
    }

    const timer = setTimeout(() => child.kill("SIGKILL"), TIMEOUT_MS);

    timer.unref();

    child.on("error", () => {
      clearTimeout(timer);
      resolve(false);
    });

    // The exit code is not enough on its own: a seek past the end of the file
    // exits 0 having written nothing, so the result is judged by what landed.
    child.on("close", () => {
      clearTimeout(timer);
      resolve(wrote(target));
    });
  });
}

function wrote(target: string): boolean {
  try {
    return fs.statSync(target).size >= MIN_BYTES;
  } catch {
    return false;
  }
}

function isReadableFile(target: string): boolean {
  try {
    return fs.statSync(target).isFile();
  } catch {
    return false;
  }
}

function discard(target: string): void {
  try {
    fs.rmSync(target, { force: true });
  } catch {
    // Nothing to clean up.
  }
}
