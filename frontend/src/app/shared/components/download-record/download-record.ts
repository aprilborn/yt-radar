import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { DownloadStatusLabels } from '../../constants';
import { AppearDirective } from '../../directives';
import { DownloadModel, DownloadStatus, PaginatorModel, Platform } from '../../models';
import { SizePipe } from '../../pipes';
import { Badge } from '../badge/badge';
import { DownloadControls } from '../download-controls/download-controls';
import { DownloadInfo } from '../download-info/download-info';
import { Poster } from '../poster/poster';
import { ProgressInfo } from '../progress-info/progress-info';
import { StatusIndicator } from '../status-indicator/status-indicator';
import { RtCard } from '../card/card';

@Component({
  selector: 'rt-download-record',
  imports: [
    RtCard,
    AppearDirective,
    MatIcon,
    MatButtonModule,
    SizePipe,
    MatTableModule,
    TitleCasePipe,
    DatePipe,
    Badge,
    StatusIndicator,
    ProgressInfo,
    DownloadInfo,
    DownloadControls,
    Poster,
  ],
  templateUrl: './download-record.html',
  styleUrl: './download-record.css',
})
export class DownloadRecord {
  download = input<DownloadModel>();
  index = input<number>();
  paginator = input<PaginatorModel>();

  cancel = output<DownloadModel>();
  retry = output<DownloadModel>();
  remove = output<{ download: DownloadModel; elementRef: HTMLElement }>();

  readonly platform = Platform;
  readonly downloadStatus = DownloadStatus;
  readonly statusLabels = DownloadStatusLabels;
}
