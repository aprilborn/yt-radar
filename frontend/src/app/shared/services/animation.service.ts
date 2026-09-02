import { effect, inject, Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AnimationService {
  static REMOVE_DOWNLOAD_DURATION = 600;

  private readonly _storage = inject(StorageService);

  constructor() {
    effect(() => {
      AnimationService.REMOVE_DOWNLOAD_DURATION = this._storage.uiConfig().enableAnimations ? 600 : 0;
    });
  }

  async animateRemoveDownload(elementRef: HTMLElement, downloadsContainer: HTMLDivElement): Promise<void> {
    elementRef.className += ' ' + 'transition-all duration-500 opacity-0';
    elementRef.style.height = elementRef.offsetHeight + 'px';
    downloadsContainer.style.height = downloadsContainer.offsetHeight + 'px';
    setTimeout(() => elementRef.classList.add('animate-shrink'), AnimationService.REMOVE_DOWNLOAD_DURATION);
    return new Promise((resolve) => setTimeout(resolve, AnimationService.REMOVE_DOWNLOAD_DURATION * 2));
  }
}
