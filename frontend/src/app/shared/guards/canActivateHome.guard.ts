import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { HttpService, StorageService } from '../services';

export const homeGuard: CanActivateFn = () => {
  const storage = inject(StorageService);
  const httpService = inject(HttpService);
  const router = inject(Router);

  if (storage.settings().metubeUrl?.length) {
    return true;
  }

  return httpService.getSettings().pipe(
    map((settings) => !!settings?.metubeUrl?.length),
    tap((isConfigured) => {
      if (!isConfigured) {
        router.navigate(['/welcome']);
      }
    }),
  );
};
