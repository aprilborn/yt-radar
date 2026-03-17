import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { useIconFactory } from './shared/providers/icons.provider';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import { errorsInterceptor } from './shared/interceptors/errors-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorsInterceptor])),
    provideNativeDateAdapter(),
    provideAppInitializer(() => {
      const initializerFn = useIconFactory(inject(DomSanitizer), inject(MatIconRegistry));
      return initializerFn();
    }),
  ],
};
