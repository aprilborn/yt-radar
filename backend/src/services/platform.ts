/**
 * Which site a download came from. Almost everything in this app was written
 * for YouTube, so several behaviours (the i.ytimg.com thumbnail guess, the
 * /channel/<id> avatar lookup, the RSS watcher itself) only make sense there.
 * Recording the platform on the row lets those stay YouTube-only instead of
 * being applied to ids that mean nothing off-site.
 */
export const PLATFORMS = ["youtube", "tiktok", "instagram", "unknown"] as const;

export type Platform = (typeof PLATFORMS)[number];

export const DEFAULT_PLATFORM: Platform = "unknown";

/**
 * yt-dlp namespaces its extractor keys per site — "Youtube", "YoutubeTab",
 * "TikTok", "TikTokUser", "Instagram", "InstagramStory" — so the prefix is
 * the stable part to match on. Add a line here to teach the app a new site.
 */
const BY_EXTRACTOR: ReadonlyArray<readonly [RegExp, Platform]> = [
  [/^youtube/i, "youtube"],
  [/^tiktok/i, "tiktok"],
  [/^instagram/i, "instagram"]
];

const BY_HOSTNAME: ReadonlyArray<readonly [RegExp, Platform]> = [
  [/(^|\.)youtube\.com$/i, "youtube"],
  [/(^|\.)youtu\.be$/i, "youtube"],
  [/(^|\.)tiktok\.com$/i, "tiktok"],
  [/(^|\.)instagram\.com$/i, "instagram"]
];

export function isPlatform(value: unknown): value is Platform {
  return PLATFORMS.includes(value as Platform);
}

/** Normalises anything read back from the database or an API payload. */
export function toPlatform(value: unknown): Platform {
  return isPlatform(value) ? value : DEFAULT_PLATFORM;
}

export function platformFromExtractor(key: unknown): Platform {
  const text = String(key ?? "");

  for (const [pattern, platform] of BY_EXTRACTOR) {
    if (pattern.test(text)) return platform;
  }

  return DEFAULT_PLATFORM;
}

export function platformFromUrl(url: unknown): Platform {
  const text = String(url ?? "");

  if (!/^https?:\/\//i.test(text)) return DEFAULT_PLATFORM;

  let hostname: string;

  try {
    ({ hostname } = new URL(text));
  } catch {
    return DEFAULT_PLATFORM;
  }

  for (const [pattern, platform] of BY_HOSTNAME) {
    if (pattern.test(hostname)) return platform;
  }

  return DEFAULT_PLATFORM;
}

/**
 * The extractor is authoritative when yt-dlp reports one, but a flat listing
 * can omit it on individual entries — fall back to the URL the entry carries.
 */
export function platformFromNode(node: any): Platform {
  const fromExtractor = platformFromExtractor(
    node?.ie_key ?? node?.extractor_key ?? node?.extractor
  );

  if (fromExtractor !== DEFAULT_PLATFORM) return fromExtractor;

  return platformFromUrl(node?.webpage_url ?? node?.url);
}
