import {ChannelInfo} from "../models/channel.model.js";

export class YoutubeService {
  static extractJson(html: string) {
    const match = html.match(/var ytInitialData = (.*?);<\/script>/);
    if (!match) return null;

    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  }

  static async getChannelInfo(url: string): Promise<ChannelInfo | null> {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;

      const html = await res.text();

      const data = YoutubeService.extractJson(html);
      if (!data) return null;

      const meta =
        data?.metadata?.channelMetadataRenderer;

      if (!meta) return null;

      const channelId = meta.externalId;
      const thumbnails = meta.avatar?.thumbnails ?? [];
      const avatar =
        thumbnails.length > 0
          ? thumbnails[thumbnails.length - 1].url
          : null;

      return {
        channelId,
        title: meta.title,
        description: meta.description.slice(0, 5000) ?? null,
        avatar,
        rssUrl: `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
      };
    } catch (e) {
      console.error("YouTube parse error:", e);
      return null;
    }
  }
}
