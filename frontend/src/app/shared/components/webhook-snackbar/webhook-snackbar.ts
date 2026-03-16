import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { SnackbarType } from '@shared/services';

@Component({
  selector: 'yt-snackbar-dialog',
  imports: [MatButton],
  template: `
    <h2 mat-dialog-title>Webhook payload example:</h2>
    <div class="text-left font-mono bg-blue-100/10 p-4 rounded-md my-4">
      <code>
        <pre>{{ '{' }}
  <span class="text-orange-500">"channelId"</span>: "ABC123",
  <span class="text-orange-500">"channel"</span>: "Channel Name",
  <span class="text-orange-500">"videoId"</span>: "4f35jL3Wd",
  <span class="text-orange-500">"title"</span>: "Video Title",
  <span class="text-orange-500">"format"</span>: "mp4"
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
}
