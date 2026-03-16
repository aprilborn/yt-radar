import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { HttpService } from '../services';

export const homeGuard: CanActivateFn = () => {
  const httpService = inject(HttpService);
  const router = inject(Router);

  return httpService.getSettings().pipe(
    map((settings) => !!settings?.metubeUrl?.length),
    tap((isConfigured) => {
      if (!isConfigured) {
        router.navigate(['/welcome']);
      }
    }),
  );
};
