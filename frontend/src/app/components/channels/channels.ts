import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
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
import { ChannelModel, PollType, Types } from '@shared/models';
import { HttpService, SnackbarService, SnackbarType, StorageService } from '@shared/services';
import { filter, Observable, switchMap, take, tap } from 'rxjs';
import { NextCheckComponent } from 'src/app/shared/components/next-check/next-check';
import { YtCard } from 'src/app/shared/components/yt-card/yt-card';
import { AudioFormatLabels, CodecLabels, VideoFormatLabels } from 'src/app/shared/constants/labels.const';
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
    TitleCasePipe,
    NextCheckComponent,
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
    'lastCaptureAt',
    'lastCheckedAt',
    'nextCheckAt',
    'actions',
    'expand',
  ];
  expandedChannel = signal<number | null>(null);
  readonly types = Types;
  readonly codecLabels = CodecLabels;
  readonly videoFormatLabels = VideoFormatLabels;
  readonly audioFormatLabels = AudioFormatLabels;
  readonly pollType: typeof PollType = PollType;
  readonly channels = this._storage.channels;
  readonly settings = this._storage.settings;
  readonly isEnabled = computed(() => this.channels().filter((c) => c.enabled).length > 0 && this.settings().enabled);
  showShine = signal(false);
  showFlip = signal(false);

  constructor() {
    effect(() => {
      if (this.channels()?.length) this.showShine.set(true);
      setTimeout(() => this.showShine.set(false), 3000);
    });
  }

  ngOnInit() {
    this._getChannels().subscribe();
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
      .subscribe();
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

  trackByFn(index: number, item: ChannelModel): ChannelModel['id'] {
    return item.id;
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
