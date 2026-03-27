import { SnackbarType } from '@shared/services';
import { ChannelModel, NextCheckModel } from './channel.model';

export interface WsMessage<T> {
  type: string;
  data: T;
}

export type WebSocketData = NotificationPayload | ChannelPayload;
export type WebSocketMessageType = 'notification' | 'metube-status' | 'next-check' | 'channel-updated';

export interface NotificationPayload {
  title?: 'notification';
  subtitle?: string;
  message: string;
  type: SnackbarType;
}

export interface ChannelPayload {
  channel: ChannelModel;
}

export interface MetubeStatusPayload {
  status: boolean;
}

export type NextCheckPayload = NextCheckModel;
