import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'yt-no-data',
  imports: [MatIcon, MatButton],
  template: `
    <div class="flex flex-col items-center justify-center h-40 mt-10 gap-2">
      <mat-icon class="h-15! w-15! text-6xl!">queue</mat-icon>
      <h1 class="text-lg font-medium">{{ message() }}</h1>
    </div>

    <div class="flex justify-center mb-5">
      <button matButton="elevated" (click)="action.emit()">
        <mat-icon>add</mat-icon>
        Add channel
      </button>
    </div>
  `,
  styleUrl: './no-data.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoData {
  message = input<string>('No data found');
  action = output<void>();
}
