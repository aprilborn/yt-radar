import { ElementRef, InjectionToken, Signal } from '@angular/core';

export interface PageElement {
  name: string;
  element: Signal<ElementRef<HTMLElement> | undefined>;
}

export const PAGE_ELEMENTS = new InjectionToken<PageElement[] | null>('PAGE_ELEMENTS');
