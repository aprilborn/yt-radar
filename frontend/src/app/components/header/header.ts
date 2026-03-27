import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton, MatMiniFabButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { SettingsDialog } from '@shared/components';
import { HttpService, SnackbarService, SnackbarType, StorageService } from '@shared/services';
import { tap } from 'rxjs';
import { WsService } from 'src/app/shared/services/ws.service';

@Component({
  selector: 'yt-header',
  imports: [MatIcon, MatButton, MatMiniFabButton],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private readonly _storage = inject(StorageService);
  private readonly _httpService = inject(HttpService);
  private readonly _wsService = inject(WsService);
  private readonly _dialog = inject(MatDialog);
  private readonly _snackBar = inject(SnackbarService);
  private readonly _destroyRef = inject(DestroyRef);

  isEnabled = computed(() => this._storage.settings().enabled ?? false);
  isConnected = signal<boolean>(true);

  ngOnInit() {
    this._wsService
      .metubeStatus$()
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        tap((status) => this.isConnected.set(status)),
      )
      .subscribe();
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
        this._snackBar.open(
          result?.enabled ? 'App is now running' : 'App is now paused',
          null,
          result?.enabled ? SnackbarType.SUCCESS : SnackbarType.INFO,
          3000,
        );
      },
      error: () => this._snackBar.open('Failed to toggle pause. Please try again.', null, SnackbarType.ERROR, 3000),
    });
  }
}
