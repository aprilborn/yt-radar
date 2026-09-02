import { inject, Injectable } from '@angular/core';
import { PAGE_ELEMENTS } from '../constants/page-elements.const';

@Injectable()
export class ScrollToService {
  private readonly _pageElements = inject(PAGE_ELEMENTS);

  scrollTo(name: string) {
    const el = this._pageElements?.find((e) => e.name === name)?.element();
    el?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
  }
}
