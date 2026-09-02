import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Settings } from '@shared/components';

@Component({
  selector: 'rt-settings-dialog',
  imports: [Settings],
  template: `<rt-settings (closeDialog)="dialogRef.close()" />`,
  styleUrl: './settings-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsDialog {
  readonly dialogRef = inject(MatDialogRef<Settings>);
}
