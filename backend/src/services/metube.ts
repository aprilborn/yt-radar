export async function sendToMeTube(opts: {
  metubeUrl: string;
  videoUrl: string;
  type: string;
  codec: string;
  format: string;
  prefix: string;
  tag: string;
}) {
  const url = new URL("/add", opts.metubeUrl);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        url: opts.videoUrl,
        quality: "best",
        download_type: opts.type,
        codec: opts.codec,
        format: opts.format,
        custom_name_prefix: opts.prefix,
        folder: opts.tag,
        auto_start: true,
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`MeTube failed: ${res.status} ${text}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}
