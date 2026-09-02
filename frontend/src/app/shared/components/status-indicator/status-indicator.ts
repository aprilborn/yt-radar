import { Component, inject, input } from '@angular/core';
import { DownloadModel, DownloadStatus } from '../../models/download.model';
import { DownloadStatusLabels } from '../../constants/labels.const';
import { MatTooltip } from '@angular/material/tooltip';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'rt-status-indicator',
  imports: [MatTooltip],
  templateUrl: './status-indicator.html',
  styleUrl: './status-indicator.css',
})
export class StatusIndicator {
  private readonly _notifier = inject(NotifierService);

  download = input<DownloadModel>();

  readonly downloadStatus = DownloadStatus;
  readonly statusLabels = DownloadStatusLabels;

  copyToClipboard(filePath: string) {
    navigator.clipboard.writeText(filePath);
    this._notifier.notify('success', 'File path copied to clipboard.');
  }
}
