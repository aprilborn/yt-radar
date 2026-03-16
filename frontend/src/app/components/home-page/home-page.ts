import { Component, inject } from '@angular/core';

import { StripedBgDirective } from '../../shared/directives';
import { StorageService } from '../../shared/services';
import { ChannelForm } from '../channel-form/channel-form';
import { Channels } from '../channels/channels';
import { Header } from '../header/header';

@Component({
  selector: 'yt-home-page',
  templateUrl: 'home-page.html',
  styleUrl: './home-page.css',
  imports: [Header, Channels, ChannelForm, StripedBgDirective],
})
export class HomePage {
  private readonly _storage = inject(StorageService);
  showForm = this._storage.showForm;
}
