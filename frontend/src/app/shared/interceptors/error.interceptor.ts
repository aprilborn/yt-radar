import type { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { catchError, throwError } from 'rxjs';

/**
 * Functional interceptors run inside the injection context of the injector that
 * created HttpClient — the root environment injector. NotifierService therefore
 * has to be provided there, which provideNotifier() in appConfig does, and only
 * there, so this is the same instance components inject and the same queue the
 * notifier container renders from.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifier = inject(NotifierService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const status = error.status || 'unknown';
      const message = error.error?.message || error.statusText || 'Request failed';

      notifier.notify('error', `${message} (status: ${status})`);

      return throwError(() => error);
    }),
  );
};
