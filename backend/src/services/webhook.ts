export async function sendWebhook(webhookUrl: string, payload: any) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Webhook failed: ${res.status} ${text}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}