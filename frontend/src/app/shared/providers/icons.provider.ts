import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { iconRegistry } from './registry';

export const useIconFactory = (sanitizer: DomSanitizer, registry: MatIconRegistry) => () =>
  Object.entries(iconRegistry).forEach((icons) => {
    icons.forEach((icon: string) => {
      registry.addSvgIcon(icon, sanitizer.bypassSecurityTrustResourceUrl(`/assets/icons/${icon}.svg`));
    });
  });
