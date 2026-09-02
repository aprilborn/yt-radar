import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export const SCROLL_TOKEN = new InjectionToken<Observable<Event>>('scroll');
export const HEIGHT_CHANGE_TOKEN = new InjectionToken<Observable<Event>>('heightChange');
export const TAB_ACTIVE_TOKEN = new InjectionToken<Observable<Event>>('visibilitychange');
