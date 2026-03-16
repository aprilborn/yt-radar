import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export enum SnackbarType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private readonly _snackBar: MatSnackBar) {}

  open(message: string, action: string, type: SnackbarType, duration: number = 3000) {
    this._snackBar.open(message, action, {
      horizontalPosition: 'right',
      panelClass: ['yt-snackbar', type],
      duration,
    });
  }
}
