import { FormControl } from '@angular/forms';
import { Nullable } from './common.model';

export enum PollType {
  INTERVAL = 'interval',
  TIME = 'time',
}

export enum Types {
  VIDEO = 'video',
  AUDIO = 'audio',
}

export enum VideoFormats {
  AUTO = 'any',
  MP4 = 'mp4',
  IOS = 'ios',
}

export enum AudioFormats {
  M4A = 'm4a',
  MP3 = 'mp3',
  OPUS = 'opus',
  WAV = 'wav',
  FLAC = 'flac',
}

export enum Codecs {
  AUTO = 'auto',
  H264 = 'h264',
  H265 = 'h265',
  AV1 = 'av1',
  VP9 = 'vp9',
}

export interface ChannelModel {
  id: Nullable<number>;
  groupId: Nullable<ChannelGroupModel['id']>;
  group?: Nullable<ChannelGroupModel>;
  sortOrder?: Nullable<number>;
  name: Nullable<string>;
  rssUrl: string;
  type: Types;
  format: VideoFormats | AudioFormats;
  codec: Codecs;
  enabled?: boolean;
  startFromLast: boolean;
  downloadShorts: boolean;
  notifyHA: boolean;
  pollType: PollType;
  pollInterval: Nullable<number>;
  pollTime: Nullable<string>;
  prefix: Nullable<string>;
  tag: Nullable<string>;
  webhookOverride: Nullable<string>;
  lastVideoId?: Nullable<string>;
  lastCheckedAt?: Date;
  nextCheckAt?: Date;
  totalDownloads?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChannelFormModel {
  id: FormControl<ChannelModel['id']>;
  name: FormControl<ChannelModel['name']>;
  rssUrl: FormControl<ChannelModel['rssUrl']>;
  type: FormControl<ChannelModel['type']>;
  format: FormControl<ChannelModel['format']>;
  codec?: FormControl<ChannelModel['codec']>;
  startFromLast: FormControl<ChannelModel['startFromLast']>;
  downloadShorts: FormControl<ChannelModel['downloadShorts']>;
  notifyHA: FormControl<ChannelModel['notifyHA']>;
  webhookOverride: FormControl<ChannelModel['webhookOverride']>;
  prefix: FormControl<ChannelModel['prefix']>;
  tag: FormControl<ChannelModel['tag']>;
  pollType: FormControl<ChannelModel['pollType']>;
  pollInterval: FormControl<ChannelModel['pollInterval']>;
  pollTime: FormControl<ChannelModel['pollTime']>;
}

export interface NextCheckModel {
  ok: boolean;
  nextCheckAt: Nullable<string>;
  channel: Nullable<{
    id: number;
    name: string;
  }>;
}

export interface ChannelGroupModel {
  id: Nullable<number>;
  name: Nullable<string>;
  sortOrder?: Nullable<number>;
  color?: Nullable<string>;
  icon?: Nullable<string>;
  createdAt?: Date;
  updatedAt?: Date;
}