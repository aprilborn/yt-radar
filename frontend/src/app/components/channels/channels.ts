import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, OnInit, Signal, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { ConfirmationDialog } from '@shared/components';
import { filterDefined } from '@shared/helpers';
import { ChannelModel, PollType } from '@shared/models';
import { HttpService, SnackbarService, SnackbarType, StorageService } from '@shared/services';
import { delay, filter, Observable, repeat, switchMap, take, tap } from 'rxjs';
import { YtCard } from 'src/app/shared/components/yt-card/yt-card';
import { DayPipe } from '../../shared/pipes/day.pipe';
import { NoData } from '../no-data/no-data';

@Component({
  selector: 'yt-channels',
  imports: [
    DatePipe,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatButton,
    MatIconButton,
    MatRow,
    MatRowDef,
    MatSlideToggle,
    MatTable,
    MatTooltip,
    MatHeaderCellDef,
    FormsModule,
    NoData,
    YtCard,
    DayPipe,
  ],
  templateUrl: './channels.html',
  styleUrl: './channels.css',
})
export class Channels implements OnInit {
  private readonly _storage = inject(StorageService);
  private readonly _httpService = inject(HttpService);
  private readonly _dialog = inject(MatDialog);
  private readonly _snackBar = inject(SnackbarService);

  displayedColumns = [
    'enabled',
    'name',
    'videoName',
    'lastCheckedAt',
    'nextCheckAt',
    'lastCaptureAt',
    'actions',
    'expand',
  ];
  expandedChannel = signal<number | null>(null);
  pollType: typeof PollType = PollType;
  channels = this._storage.channels;
  settings = this._storage.settings;
  isEnabled = computed(() => this.channels().filter(c => c.enabled).length > 0 && this.settings().enabled);
  showShine = signal(false);
  showFlip = signal(false);
  now = signal(Date.now());
  closestCheckIn: Signal<{ displayTime: string; totalSeconds: number; channel: string }>;
  closestCheckIn$;

  constructor() {
    effect(() => {
      if (this.channels()?.length) this.showShine.set(true);
      setTimeout(() => this.showShine.set(false), 3000);
    });

    setInterval(() => {
      this.now.set(Date.now());
    }, 1000);

    this.closestCheckIn = computed(() => {
      const now = this.now();
      const channels = this.channels();
      const fallback = { displayTime: '—', totalSeconds: 0, channel: '' };

      if (!channels?.length) return fallback;

      const nextCheck = channels
        .filter((c) => c.enabled && c.nextCheckAt)
        .reduce((min, c) => {
          const t = new Date(c.nextCheckAt!).getTime();
          return Math.min(min, t);
        }, Infinity);

      if (!isFinite(nextCheck)) return fallback;

      const diff = Math.max(nextCheck - now, 0);

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      return {
        displayTime: `${hours ? `${hours}h ` : ''}${minutes ? `${minutes}m ` : ''}${seconds ? `${seconds}s` : '0s'}`,
        totalSeconds: Math.floor(diff / 1000),
        channel: channels.find((c) => new Date(c.nextCheckAt!).getTime() === nextCheck)?.name || '',
      };
    });

    this.closestCheckIn$ = toObservable(this.closestCheckIn);
  }

  ngOnInit() {
    this._getChannels().subscribe();

    this.closestCheckIn$
      .pipe(
        filter(({ totalSeconds }) => totalSeconds === 1),
        take(1),
        delay(3000),
        switchMap(() => this._getChannels()),
        repeat(),
      )
      .subscribe();
  }

  toggleChannel(enabled: boolean, channel: ChannelModel) {
    this._httpService
      .updateChannel({ ...channel, enabled })
      .pipe(
        filterDefined(),
        tap((channel: ChannelModel) => this._updateStorageChannels(channel)),
      )
      .subscribe();
  }

  editChannel(channel: ChannelModel) {
    this._storage.editingChannel.set(channel);
    this._storage.showForm.set(true);
  }

  deleteChannel(id: ChannelModel['id']) {
    this._openConfirmationDialog()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => this._httpService.deleteChannel(id)),
      )
      .subscribe(() => this._storage.channels.set(this._storage.channels().filter((c) => c.id !== id)));
  }

  runOnce(id: ChannelModel['id']) {
    this._httpService
      .runOnceChannel(id)
      .pipe(
        filterDefined(),
        switchMap(() => this._httpService.getChannels()),
      )
      .subscribe(() => {
        this._snackBar.open('Channel checked successfully', null, SnackbarType.SUCCESS);
      });
  }

  refreshChannels(withAnimation = false): void {
    if (withAnimation) this.showFlip.set(true);

    setTimeout(() => {
      this.showFlip.set(false);

      this._getChannels().subscribe({
        next: (channels) => {
          this._storage.channels.set(channels);
          this._snackBar.open('Channels refreshed successfully', null, SnackbarType.SUCCESS);
        },
        error: () => {
          this._snackBar.open('Failed to refresh channels', null, SnackbarType.ERROR);
        },
      });
    }, 1000);
  }

  showForm(): void {
    this._storage.editingChannel.set(null);
    this._storage.showForm.set(true);
  }

  private _getChannels(): Observable<ChannelModel[]> {
    return this._httpService.getChannels();
  }

  private _openConfirmationDialog(): Observable<boolean> {
    const dialogRef = this._dialog.open(ConfirmationDialog, {
      // autoFocus: false,
      restoreFocus: false,
      data: {
        title: 'Confirmation',
        message: 'Are you sure you want to delete this channel?',
      },
    });

    return dialogRef.afterClosed();
  }

  private _updateStorageChannels(channel: ChannelModel) {
    this._storage.channels.set(
      this._storage.channels().map((c) => (c.id === channel.id ? channel : c)) as ChannelModel[],
    );
  }
}
