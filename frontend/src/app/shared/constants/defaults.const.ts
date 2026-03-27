import { Codecs, SettingsModel, Types, VideoFormats } from '@shared/models';
import { ChannelModel, PollType } from '../models';

export const DefaultChannel: ChannelModel = {
  id: null,
  groupId: null,
  sortOrder: 0,
  name: null,
  rssUrl: '',
  type: Types.VIDEO,
  codec: Codecs.AUTO,
  format: VideoFormats.AUTO,
  startFromLast: false,
  downloadShorts: false,
  notifyHA: false,
  webhookOverride: '',
  prefix: '',
  tag: '',
  pollType: PollType.TIME,
  pollInterval: null,
  pollTime: null,
};

export const ChannelMock: ChannelModel = {
  id: 1,
  groupId: null,
  sortOrder: 0,
  name: 'Favorite Channel',
  rssUrl: 'https://youtube.com/rss/url/test',
  type: Types.VIDEO,
  codec: Codecs.AUTO,
  format: VideoFormats.AUTO,
  enabled: true,
  startFromLast: true,
  downloadShorts: false,
  notifyHA: true,
  pollType: PollType.INTERVAL,
  pollInterval: 30,
  pollTime: null,
  prefix: 'Prefix',
  tag: 'youtube',
  webhookOverride: 'https://homeassistant:8123/api/webhook/-a456-426614174000',
  lastVideoId: 'F43xPrFANw',
  lastCheckedAt: new Date('2024-01-01T10:00:00Z'),
  totalDownloads: 0,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-06-01T12:00:00Z'),
};

export const DefaultSettings: SettingsModel = {
  enabled: true,
  metubeUrl: null,
  webhookUrl: null,
};

export const SettingsMock: SettingsModel = {
  id: 1,
  enabled: true,
  metubeUrl: 'http://metube:30094',
  webhookUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};
