import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { SnackbarType } from '@shared/services';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'yt-snackbar-dialog',
  imports: [MatButton, MatIcon, MatTooltip],
  template: `
    <h2 mat-dialog-title>Webhook payload example:</h2>
    <div class="text-left font-mono bg-blue-100/10 p-4 rounded-md my-4 relative">
      <mat-icon
        fontIcon="content_copy"
        class="cursor-pointer absolute top-2 right-2 text-sm! w-4! h-4!"
        (click)="copyToClipboard()"
        matTooltip="Copy to clipboard"
      />

      <code>
        <pre>{{ '{' }}
  <span class="text-orange-500">"channelId"</span>: "ABC123",
  <span class="text-orange-500">"channel"</span>: "Channel Name",
  <span class="text-orange-500">"videoId"</span>: "4f35jL3Wd",
  <span class="text-orange-500">"title"</span>: "Video Title",
  <span class="text-orange-500">"type"</span>: "video",
  <span class="text-orange-500">"date"</span>: "2026-03-24T12:00:00.000Z"
{{ '}' }}</pre>
      </code>
    </div>
    <div class="flex justify-end">
      <button mat-flat-button (click)="snackBar.dismiss()">OK</button>
    </div>
  `,
  styleUrl: './webhook-snackbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebhookSnackbar {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) protected readonly data: { type: SnackbarType; duration: number },
    protected readonly snackBar: MatSnackBarRef<WebhookSnackbar>,
  ) {}

  copyToClipboard() {
    navigator.clipboard.writeText(`{
  "channelId": "ABC123",
  "channel": "Channel Name",
  "videoId": "4f35jL3Wd",
  "title": "Video Title",
  "format": "mp4"
}`);
  }
}
