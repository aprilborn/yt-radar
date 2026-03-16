import { Component, computed, inject, OnInit } from '@angular/core';
import { MatButton, MatMiniFabButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { SettingsDialog } from '@shared/components';
import { HttpService, SnackbarService, SnackbarType, StorageService } from '@shared/services';

@Component({
  selector: 'yt-header',
  imports: [MatIcon, MatTooltip, MatButton, MatMiniFabButton],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private readonly _storage = inject(StorageService);
  private readonly _httpService = inject(HttpService);
  private readonly _dialog = inject(MatDialog);
  private readonly _snackBar = inject(SnackbarService);

  isEnabled = computed(() => this._storage.settings().enabled ?? false);
  isConnected = this._storage.isMetubeValid;

  ngOnInit() {
    this._httpService.validateMetube().subscribe(({ status }) => this._storage.isMetubeValid.set(status));
  }

  openDialog(): void {
    const dialogRef = this._dialog.open(SettingsDialog, { maxWidth: '500px' });
    dialogRef.afterClosed().subscribe();
  }

  togglePause() {
    this._httpService.toggleEnabled().subscribe({
      next: (result) => {
        this._storage.settings.set({
          ...this._storage.settings(),
          enabled: result?.enabled ?? false,
        });
        this._snackBar.open(result?.enabled ? 'Running' : 'Paused', null, SnackbarType.INFO, 3000);
      },
      error: () => this._snackBar.open('Failed to toggle pause.', null, SnackbarType.ERROR, 3000),
    });
  }
}
