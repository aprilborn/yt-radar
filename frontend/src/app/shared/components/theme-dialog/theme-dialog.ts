import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Theme } from '../theme/theme';

@Component({
  selector: 'rt-theme-dialog',
  imports: [Theme],
  template: `<rt-theme (closeDialog)="dialogRef.close()" />`,
  styleUrl: './theme-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeDialog {
  readonly dialogRef = inject(MatDialogRef<Theme>);
}
