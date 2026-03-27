import { Injectable } from '@angular/core';
import { catchError, filter, map, Observable, of } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import {
  ChannelPayload,
  MetubeStatusPayload,
  NextCheckPayload,
  NotificationPayload,
  WebSocketData,
  WebSocketMessageType,
  WsMessage,
} from '../models/websocket.model';

@Injectable({
  providedIn: 'root',
})
export class WsService {
  private readonly _socket: Socket;

  wsMessage$<T>(type: WebSocketMessageType): Observable<T> {
    return new Observable<WsMessage<WebSocketData>>((subscriber) => {
      const handler = (message: WsMessage<WebSocketData>) => subscriber.next(message);

      this._socket.on('message', handler);

      return () => this._socket.off('message', handler);
    }).pipe(
      filter((message) => message.type === type),
      map((message) => message.data as T),
    );
  }

  constructor() {
    this._socket = io({
      path: '/ws',
      transports: ['websocket'],
    });
  }

  metubeStatus$(): Observable<boolean> {
    return this.wsMessage$<MetubeStatusPayload>('metube-status').pipe(
      map(({ status }) => status),
      catchError(() => of(false)),
    );
  }

  nextCheck$(): Observable<NextCheckPayload> {
    return this.wsMessage$<NextCheckPayload>('next-check');
  }

  channelUpdated$(): Observable<ChannelPayload> {
    return this.wsMessage$<ChannelPayload>('channel-updated');
  }

  closeMetubeConnection() {
    this._socket.disconnect();
  }

  notifications$(): Observable<NotificationPayload> {
    return this.wsMessage$<NotificationPayload>('notification');
  }
}
