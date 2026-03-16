// export interface ChannelDTO {
//   rssUrl: string;
//   format: "mp4" | "mp3";
//   startFromLast: boolean;
//   downloadShorts: boolean;
//   notifyHA: boolean;
//
//   pollType: "interval" | "time";
//   pollInterval?: number | null;
//   pollTime?: Date | null;
//
//   prefix?: string | null;
//   tag?: string | null;
//   webhookOverride?: string | null;
// }
// export interface Channel extends ChannelDTO {
//   id: number;
//   lastVideoId?: string | null;
//   lastCheckedAt?: Date | null;
//   enabled: boolean;
// }

export interface VideoInfo {
  videoId: string
  title: string | null
  description: string | null
  thumbnail: string | null
  link: string | null
  published: string | null
}

export interface ChannelInfo {
  channelId: string
  title: string
  description: string | null
  avatar: string | null
  rssUrl: string
}