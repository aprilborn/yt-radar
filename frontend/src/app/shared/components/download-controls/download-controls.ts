import { Component, inject, input, output } from '@angular/core';
import { DownloadModel, DownloadStatus } from '../../models/download.model';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'rt-download-controls',
  imports: [MatIcon, MatButtonModule],
  templateUrl: './download-controls.html',
  styleUrl: './download-controls.css',
})
export class DownloadControls {
  private readonly _httpService = inject(HttpService);
  readonly downloadStatus = DownloadStatus;

  download = input<DownloadModel>();
  isActive = input<boolean>();
  isPathAvailable = input<boolean>();

  retry = output<void>();
  remove = output<void>();

  saveAs(download: DownloadModel) {
    if (!download.filePath) return;

    const link = document.createElement('a');

    link.href = this._httpService.downloadFileUrl(download.id);
    link.download = '';
    link.rel = 'noopener';

    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
