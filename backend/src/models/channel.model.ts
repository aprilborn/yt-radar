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