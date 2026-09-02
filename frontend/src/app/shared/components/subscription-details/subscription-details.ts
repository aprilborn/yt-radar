import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Codecs, PollType, SubscriptionModel, Types } from '@shared/models';
import { AudioFormatLabels, CodecLabels, VideoFormatLabels } from '../../constants/labels.const';
import { TimeFormat, TimePipe } from '../../pipes/time.pipe';
import { StorageService } from '../../services/storage.service';
import { RtCard } from '../card/card';
import { DayPipe } from '../../pipes/day.pipe';

@Component({
  selector: 'rt-subscription-details',
  imports: [RtCard, TitleCasePipe, TimePipe, MatTooltip, MatIcon, DatePipe, DayPipe],
  templateUrl: './subscription-details.html',
  styleUrl: './subscription-details.css',
})
export class SubscriptionDetails {
  private readonly _storage = inject(StorageService);
  sub = input<SubscriptionModel>();
  isExpanded = input<boolean>(false);

  readonly types = Types;
  readonly pollType = PollType;
  readonly codec = Codecs;
  readonly codecLabels = CodecLabels;
  readonly videoFormatLabels = VideoFormatLabels;
  readonly audioFormatLabels = AudioFormatLabels;
  readonly TimeFormat = TimeFormat;

  readonly settings = this._storage.settings;
}
