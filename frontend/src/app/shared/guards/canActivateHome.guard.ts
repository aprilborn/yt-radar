import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { forkJoin, map, tap } from 'rxjs';
import { HttpService } from '../services';

export const homeGuard: CanActivateFn = () => {
  const httpService = inject(HttpService);
  const router = inject(Router);

  return forkJoin([httpService.getSettings(), httpService.getChannels()]).pipe(
    map(
      ([settings, channels]) => !!settings?.metubeUrl?.length && settings?.metubeUrl !== null && channels?.length > 0,
    ),
    tap((isConfigured) => {
      if (!isConfigured) {
        router.navigate(['/welcome']);
      }
    }),
  );
};
