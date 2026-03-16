import { FormControl } from '@angular/forms';
import { Nullable } from './common.model';

export enum PollType {
  INTERVAL = 'interval',
  TIME = 'time',
}

export enum Formats {
  MP4 = 'mp4',
  MP3 = 'mp3',
}

export interface ChannelModel {
  id: Nullable<number>;
  sortOrder?: Nullable<number>;
  name: Nullable<string>;
  rssUrl: string;
  format: Formats;
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
  format: FormControl<ChannelModel['format']>;
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
