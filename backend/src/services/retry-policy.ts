/**
 * Retrying is the default, and this lists the exceptions: errors describing a
 * condition no number of attempts can change.
 *
 * The inverse — listing the errors worth retrying — was tried first and is the
 * wrong way round. Extractors phrase failures in ways that shift release to
 * release, so anything unanticipated fell through to a hard failure, which is
 * precisely the case a retry exists for. Guessing wrong in this direction is
 * also far cheaper: an unrecognised permanent error costs a couple of fast
 * failed attempts, an unrecognised transient one costs the download.
 */
const PERMANENT_ERROR =
  /video is unavailable|Video unavailable|Private video|members[- ]only|removed by the uploader|account has been terminated|does not exist|Unsupported URL|is not a valid URL|Requested format is not available|Sign in to confirm|age[- ]restricted|IP address is blocked|HTTP Error 404|no longer available|has been deleted/i;

/**
 * Failures that happened in ffmpeg or ffprobe rather than in the extractor.
 * They read as three unrelated errors and are one thing — the tool died, so
 * yt-dlp reports whatever it last printed (often nothing more than the
 * version banner) or fails to parse JSON it never received:
 *
 *   ERROR: Postprocessing:   libpostproc    58.  1.100 / 58.  1.100
 *   ERROR: ffmpeg exited with code -11
 *   ERROR: Expecting value: line 1 column 1 (char 0)
 *
 * Worth separating because the video was fetched perfectly well: the bytes
 * are already on disk and only the merge, remux or fixup failed. Downloading
 * them again — which is what a retry does, from zero, possibly gigabytes —
 * cannot change the outcome, because nothing about the second attempt asks
 * ffmpeg to behave differently. An unstable stream can produce the same
 * message, so a manual retry is still offered; what this stops is the queue
 * spending four full downloads to arrive back at the same error.
 */
const FFMPEG_ERROR =
  /Postprocessing:|ffmpeg exited with code|ffprobe|Expecting value: line 1 column 1|Conversion failed/i;

export function isFfmpegFailure(error: string | null | undefined): boolean {
  return !!error && FFMPEG_ERROR.test(error);
}

/**
 * Deliberately unaware of the ffmpeg errors above: resolving a URL never
 * invokes ffmpeg, so for that caller an empty-JSON failure means an extractor
 * came back with nothing — which is exactly what a retry is for. The download
 * queue, where the same message does mean ffmpeg, handles it before asking.
 */
export function isPermanent(error: string | null | undefined): boolean {
  return !!error && PERMANENT_ERROR.test(error);
}
