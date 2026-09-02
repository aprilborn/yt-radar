import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { HttpService, StorageService, WsService } from '@shared/services';
import { startWith, switchMap } from 'rxjs';

@Component({
  selector: 'rt-widget-page',
  imports: [MatCardModule, MatTooltip],
  templateUrl: './widget-page.html',
  styleUrl: './widget-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetPage implements OnInit {
  private readonly _http = inject(HttpService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _id = this._route.snapshot.paramMap.get('id');
  private readonly _storage = inject(StorageService);
  private readonly _ws = inject(WsService);

  channel = computed(() => this._storage.subscriptions().find((c) => c.id === +this._id));

  ngOnInit(): void {
    this._ws
      .nextCheck$()
      .pipe(
        startWith(null),
        switchMap(() => this._http.getSubscription(+this._id)),
      )
      .subscribe();
  }
}
