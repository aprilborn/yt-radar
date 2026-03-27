import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '@shared/services';
import { YtCard } from 'src/app/shared/components/yt-card/yt-card';

@Component({
  selector: 'yt-widget-page',
  imports: [AsyncPipe, MatCardModule, YtCard, MatTooltip],
  templateUrl: './widget-page.html',
  styleUrl: './widget-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetPage {
  private readonly _http = inject(HttpService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _id = this._route.snapshot.paramMap.get('id');

  channel$ = this._http.getChannel(+this._id);
}
