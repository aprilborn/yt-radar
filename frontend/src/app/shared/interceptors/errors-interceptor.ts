import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SnackbarService, SnackbarType } from '../services';
import { tap } from 'rxjs';

export const errorsInterceptor: HttpInterceptorFn = (req, next) => {
  const _snackBar = inject(SnackbarService);

  return next(req).pipe(
    // catch error responses
    tap({
      error: (err) => {
        // Show a snackbar with error status
        // Can't import MatSnackBar here; use window.alert as fallback example
        const status = err?.status ?? 'Unknown error';
        const message = (err?.error?.message || err?.statusText || '') + ` (status: ${status})`;
        // If Angular Snackbar is available, you could inject and use it instead of alert
        _snackBar.open(message, 'OK', SnackbarType.ERROR, null);
      },
    }),
  );
};
