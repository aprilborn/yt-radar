import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { DefaultSettings } from '../constants';
import { ChannelModel, NextCheckModel } from '../models';
import { StorageService } from './storage.service';
import { SettingsModel } from '../../shared';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly _http = inject(HttpClient);
  private readonly _storage = inject(StorageService);

  getSettings(): Observable<SettingsModel> {
    return this._http.get<SettingsModel>('/api/settings').pipe(
      tap((settings) => this._storage.settings.set(settings)),
      catchError(async () => DefaultSettings),
    );
  }

  saveSettings(settings: SettingsModel): Observable<SettingsModel> {
    return this._http
      .post<SettingsModel>('/api/settings', settings)
      .pipe(tap((settings) => this._storage.settings.set(settings)));
  }

  getChannels(): Observable<ChannelModel[]> {
    return this._http.get<ChannelModel[]>('/api/channels').pipe(
      tap((channels) => this._storage.channels.set(channels)),
      catchError(async () => []),
    );
  }

  getNextCheck(): Observable<NextCheckModel> {
    return this._http.get<NextCheckModel>('/api/next-check').pipe(
      tap((nextCheck) => this._storage.nextCheck.set(nextCheck)),
      catchError(async () => ({ ok: false, nextCheckAt: null, channel: null })),
    );
  }

  addChannel(channel: ChannelModel): Observable<ChannelModel> {
    return this._http.post<ChannelModel>('/api/channels', { ...channel, url: channel.rssUrl });
  }

  updateChannel(channel: ChannelModel): Observable<ChannelModel> {
    return this._http.put<ChannelModel>(`/api/channels/${channel.id}`, channel);
  }

  deleteChannel(id: number): Observable<void> {
    return this._http.delete<void>(`/api/channels/${id}`);
  }

  runOnceAll(): Observable<{ ok: boolean }> {
    return this._http.post<{ ok: boolean }>(`/api/actions/run-once-all`, {});
  }

  runOnceChannel(id: number): Observable<void> {
    return this._http.post<void>(`/api/actions/run-once/${id}`, {});
  }

  toggleEnabled(): Observable<{ enabled: boolean }> {
    return this._http.post<{ enabled: boolean }>(`/api/actions/toggle-enabled`, {});
  }

  validateMetube(url: string = this._storage.settings()?.metubeUrl): Observable<{ status: boolean }> {
    if (!url?.trim()?.length) return of({ status: false });
    return this._http.post<{ status: boolean }>(`/api/settings/validate-metube`, { url });
  }

  sendWebhook(url: string, body: string = null): Observable<{ ok: boolean }> {
    return this._http.post<{ ok: boolean }>(`/api/actions/send-webhook`, { url, body });
  }
}
