import Parser from "rss-parser";
const parser = new Parser({
  customFields: {
    item: [
      ['media:group', 'mediaGroup'],
      ['media:description', ['mediaGroup', 'media:description']],
      ['media:thumbnail', ['mediaGroup', 'media:thumbnail']],
    ],
  },
});

export type RssResult = {
  videoId: string
  title?: string
  description?: string
  thumbnail?: string
  link?: string
  published?: string
} | null;

export type RssFetchResult = {
  videoId: string | null
  title?: string
  description?: string
  thumbnail?: string
  link?: string
  published?: string
  etag?: string | null
  notModified?: boolean
};

function extractYouTubeVideoId(entry: any): string | null {

  const id: string | undefined = entry?.id;

  if (id && id.includes("yt:video:")) {
    return id.split("yt:video:")[1] ?? null;
  }

  const link: string | undefined = entry?.link;

  if (link) {
    const m = link.match(/[?&]v=([^&]+)/);
    if (m?.[1]) return m[1];
  }

  return null;
}

export async function getLatestVideo(
  rssUrl: string,
  prevEtag?: string | null
): Promise<RssFetchResult | null> {

  const headers: Record<string,string> = {};

  if (prevEtag) {
    headers["If-None-Match"] = prevEtag;
  }

  const res = await fetch(rssUrl, { headers });

  if (res.status === 304) {
    return {
      videoId: null,
      notModified: true,
      etag: prevEtag ?? null
    };
  }

  if (!res.ok) {
    throw new Error(`RSS fetch failed: ${res.status}`);
  }

  const xml = await res.text();

  const feed = await parser.parseString(xml);

  const entry = feed.items?.[0];
  

  if (!entry) {
    return {
      videoId: null,
      etag: res.headers.get("etag")
    };
  }

  const videoId = extractYouTubeVideoId(entry);

  return {
    videoId,
    title: entry?.title,
    description: entry.mediaGroup?.['media:description'][0] ?? null,
    thumbnail: entry.mediaGroup?.['media:thumbnail']?.[0]?.$.url ?? null,
    link: entry?.link,
    published: entry?.pubDate,
    etag: res.headers.get("etag")
  };
}



export async function getFeedInfo(rssUrl: string) {
  const feed = await parser.parseURL(rssUrl);
  return {
    channelName: feed.name,
    title: feed.title,
    image: feed.image?.url ?? null
  };
}