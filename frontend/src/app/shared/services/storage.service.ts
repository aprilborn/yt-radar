import { Injectable, signal } from '@angular/core';
import { DefaultSettings } from '../constants/defaults.const';
import { ChannelModel, NextCheckModel, Nullable, SettingsModel } from '../models';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  channels = signal<ChannelModel[]>([]);
  settings = signal<SettingsModel>(DefaultSettings);
  editingChannel = signal<Nullable<ChannelModel>>(null);
  showForm = signal<boolean>(false);
  isMetubeValid = signal<boolean>(false);
  nextCheck = signal<Nullable<NextCheckModel>>(null);
}
