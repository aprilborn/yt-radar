/**
 * The statuses a download row can hold. This list is the source of truth for
 * both halves of the API surface: the `statuses` filter on GET /api/downloads
 * and the per-status counts from GET /api/downloads/info.
 *
 * It mirrors the DownloadStatus enum on the frontend, and the counts endpoint
 * is keyed by these exact strings — so a status is one word everywhere, and
 * the UI can look a count up by the status it is filtering on.
 */
export const DOWNLOAD_STATUSES = [
  "queued",
  "running",
  "done",
  "failed",
  "canceled"
] as const;

export type DownloadStatus = (typeof DOWNLOAD_STATUSES)[number];

export function isDownloadStatus(value: unknown): value is DownloadStatus {
  return DOWNLOAD_STATUSES.includes(value as DownloadStatus);
}

/**
 * Counts across the whole table, not just the page being shown. `total` is
 * every row, including any status not broken out above, so the numbers never
 * quietly stop adding up.
 */
export type DownloadInfo = Record<DownloadStatus, number> & { total: number };

/** A zeroed set of counts: a UI binding to `info.failed` must get 0, not undefined. */
export function emptyDownloadInfo(): DownloadInfo {
  const counts = Object.fromEntries(
    DOWNLOAD_STATUSES.map((status) => [status, 0])
  ) as Record<DownloadStatus, number>;

  return { ...counts, total: 0 };
}
