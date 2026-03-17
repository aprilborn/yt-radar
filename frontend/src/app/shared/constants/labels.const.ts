import { AudioFormats, Codecs, VideoFormats } from "@shared/models";

export const CodecLabels: Record<Codecs, string> = {
  [Codecs.AUTO]: 'Auto',
  [Codecs.H264]: 'H.264 (AVC)',
  [Codecs.H265]: 'H.265 (HEVC)',
  [Codecs.AV1]: 'AV1',
  [Codecs.VP9]: 'VP9',
};

export const VideoFormatLabels: Record<VideoFormats, string> = {
  [VideoFormats.AUTO]: 'Auto',
  [VideoFormats.MP4]: 'MP4',
  [VideoFormats.IOS]: 'iOS',
};

export const AudioFormatLabels: Record<AudioFormats, string> = {
  [AudioFormats.M4A]: 'M4A',
  [AudioFormats.MP3]: 'MP3',
  [AudioFormats.OPUS]: 'OPUS',
  [AudioFormats.WAV]: 'WAV',
  [AudioFormats.FLAC]: 'FLAC',
};