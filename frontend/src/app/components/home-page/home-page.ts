import { Component, DestroyRef, inject } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, Observable, tap } from 'rxjs';
import { WsService } from 'src/app/shared/services/ws.service';
import { StripedBgDirective } from '../../shared/directives';
import { SnackbarService, StorageService } from '../../shared/services';
import { ChannelForm } from '../channel-form/channel-form';
import { Channels } from '../channels/channels';
import { Header } from '../header/header';
import { NextCheckModel } from 'src/app/shared/models/channel.model';
import { ChannelPayload, NextCheckPayload, NotificationPayload } from 'src/app/shared/models/websocket.model';

@Component({
  selector: 'yt-home-page',
  templateUrl: 'home-page.html',
  styleUrl: './home-page.css',
  imports: [Header, Channels, ChannelForm, StripedBgDirective],
})
export class HomePage {
  private readonly _storage = inject(StorageService);
  private readonly _wsService = inject(WsService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _snackbar = inject(SnackbarService);

  settings = this._storage.settings;
  showForm = this._storage.showForm;

  ngOnInit() {
    this._serverNotifications().subscribe();

    this._nextCheckUpdates().subscribe();

    this._channelUpdates().subscribe();
  }

  private _serverNotifications(): Observable<NotificationPayload> {
    return this._wsService.notifications$().pipe(
      takeUntilDestroyed(this._destroyRef),
      tap((notification) => this._snackbar.notify(notification, 'OK', notification.type, null)),
    );
  }

  private _nextCheckUpdates(): Observable<NextCheckPayload> {
    return this._wsService.nextCheck$().pipe(
      takeUntilDestroyed(this._destroyRef),
      filter((response) => response?.ok),
      tap((nextCheck) => this._updateChannel(nextCheck)),
      tap((nextCheck) => this._storage.nextCheck.set(nextCheck)),
    );
  }

  private _channelUpdates(): Observable<ChannelPayload> {
    return this._wsService.channelUpdated$().pipe(
      takeUntilDestroyed(this._destroyRef),
      tap((data) => {
        this._storage.channels.update((channels) => channels.map((c) => (c.id === data.channel.id ? data.channel : c)));
      }),
    );
  }

  private _updateChannel(nextCheck: NextCheckModel) {
    this._storage.channels.update((channels) => {
      return channels.map((channel) => {
        if (channel.id === nextCheck.channel.id) {
          channel.lastCheckedAt = new Date(this._storage.nextCheck().nextCheckAt);
          channel.nextCheckAt = new Date(nextCheck.nextCheckAt);
        }
        return channel;
      });
    });
  }
}
