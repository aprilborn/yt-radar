import { NgComponentOutlet } from '@angular/common';
import { ApplicationRef, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HEIGHT_CHANGE_TOKEN, SCROLL_TOKEN, TAB_ACTIVE_TOKEN } from '@shared/constants';
import { NotifierContainerComponent } from 'angular-notifier';
import { fromEvent } from 'rxjs';
import { HttpService } from './shared/services/http.service';
import { StorageService } from './shared/services/storage.service';

@Component({
  selector: 'rt-root',
  template: `
    <router-outlet />
    <ng-container *ngComponentOutlet="notifierContainer; injector: rootInjector; environmentInjector: rootInjector" />
  `,
  /**
   * NotifierModule deliberately does NOT appear here. Listing an NgModule that
   * carries providers in a standalone component's `imports` makes Angular spin
   * up a `Standalone[App]` environment injector holding its own copy of every
   * one of those providers — a second NotifierQueueService that the container
   * would then listen on, while errorInterceptor keeps pushing to the root one.
   *
   * NotifierContainerComponent is not standalone, so it cannot go in `imports`
   * directly either. NgComponentOutlet renders it instead, pinned explicitly to
   * the root environment injector so it resolves the same queue the interceptor
   * and every component inject.
   */
  imports: [RouterOutlet, NgComponentOutlet],
  providers: [
    {
      provide: SCROLL_TOKEN,
      useValue: fromEvent(document, 'scroll'),
    },
    {
      provide: HEIGHT_CHANGE_TOKEN,
      useValue: fromEvent(window, 'resize'),
    },
    {
      provide: TAB_ACTIVE_TOKEN,
      useValue: fromEvent(document, 'visibilitychange'),
    },
  ],
})
export class App implements OnInit {
  private readonly _http = inject(HttpService);
  private readonly _storage = inject(StorageService);
  protected readonly notifierContainer = NotifierContainerComponent;

  /**
   * `ApplicationRef.injector` is the root environment injector by definition,
   * so this stays correct even if App later imports an NgModule and does gain a
   * standalone injector of its own.
   */
  protected readonly rootInjector = inject(ApplicationRef).injector;

  ngOnInit(): void {
    this._http.getUiConfig().subscribe();
    this._http.getSettings().subscribe();
  }
}
