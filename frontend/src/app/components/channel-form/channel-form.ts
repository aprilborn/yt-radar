import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatOption } from '@angular/material/core';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatHint, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTimepicker, MatTimepickerInput, MatTimepickerToggle } from '@angular/material/timepicker';
import { MatTooltip } from '@angular/material/tooltip';
import { DefaultChannel } from '@shared/constants';
import { equalJson } from '@shared/helpers';
import { AudioFormats, ChannelFormModel, ChannelModel, Codecs, PollType, Types, VideoFormats } from '@shared/models';
import { HttpService, SnackbarService, SnackbarType, StorageService } from '@shared/services';
import { YtValidators } from '@shared/validators';
import { catchError, combineLatest, map, Observable, of, startWith, tap } from 'rxjs';
import { AudioFormatLabels, CodecLabels, VideoFormatLabels } from 'src/app/shared/constants/labels.const';

@Component({
  selector: 'yt-channel-form',
  imports: [
    AsyncPipe,
    MatAutocompleteModule,
    FormsModule,
    MatAccordion,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatError,
    MatExpansionPanel,
    MatExpansionPanelDescription,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatFormField,
    MatHint,
    MatIcon,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatSlideToggle,
    ReactiveFormsModule,
    MatSuffix,
    MatTimepickerToggle,
    MatTimepickerInput,
    MatTimepicker,
    MatTooltip,
  ],
  templateUrl: './channel-form.html',
  styleUrl: './channel-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChannelForm implements OnInit {
  private readonly _fb = new FormBuilder();
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _httpService = inject(HttpService);
  private readonly _storage = inject(StorageService);
  private readonly _formDirective = viewChild<FormGroupDirective>(FormGroupDirective);
  private readonly _formElRef = viewChild<ElementRef>('formEl');
  private readonly _snackBar = inject(SnackbarService);

  protected readonly defaultChannel = DefaultChannel;
  readonly globalWebhook$ = toObservable(this._storage.settings).pipe(map((settings) => settings.webhookUrl));

  form!: FormGroup<ChannelFormModel>;
  isSaving = signal(false);
  isEditing = computed(() => !!this._storage.editingChannel());
  folders = computed<string[]>(() => [...new Set(this._storage.channels()?.map(({ tag }) => tag))].filter(Boolean));

  readonly codecs = Codecs;
  readonly types = Types;
  readonly videoFormats = VideoFormats;
  readonly audioFormats = AudioFormats;
  readonly videoFormatLabels = VideoFormatLabels;
  readonly audioFormatLabels = AudioFormatLabels;
  readonly codecLabels = CodecLabels;

  formatOptions$: Observable<VideoFormats[] | AudioFormats[]>;
  codecOptions = Object.values(this.codecs);

  constructor() {
    this._trackChannel();

    this.form = this._fb.group<ChannelFormModel>({
      id: this._fb.control(null),
      name: this._fb.control(null),
      rssUrl: this._fb.control('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^https?:\/\//)],
      }),
      type: this._fb.control(Types.VIDEO, { nonNullable: true, validators: Validators.required }),
      format: this._fb.control(this.videoFormats.AUTO, { nonNullable: true, validators: Validators.required }),
      codec: this._fb.control(this.codecs.AUTO),
      startFromLast: this._fb.control(true, { nonNullable: true, validators: Validators.required }),
      downloadShorts: this._fb.control(false, {
        nonNullable: true,
        validators: Validators.required,
      }),
      notifyHA: this._fb.control(false, { nonNullable: true, validators: Validators.required }),
      webhookOverride: this._fb.control({ value: '', disabled: true }),
      prefix: this._fb.control(''),
      tag: this._fb.control(''),
      pollType: this._fb.control(PollType.INTERVAL, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      pollInterval: this._fb.control(null, {
        nonNullable: false,
        validators: [Validators.required, Validators.min(1), Validators.max(1440)],
      }),
      pollTime: this._fb.control(null),
    });

    this.formatOptions$ = this.form.controls.type.valueChanges.pipe(
      startWith(this.form.controls.type.value),
      map(() =>
        this.form.controls.type.value === Types.VIDEO
          ? Object.values(this.videoFormats)
          : Object.values(this.audioFormats),
      ),
      takeUntilDestroyed(this._destroyRef),
    );
  }

  ngOnInit() {
    this._trackWebhook();
    this._trackPollType();
    this._trackType();
    this._scrollToTop();
  }

  save(channel: Partial<ChannelModel>) {
    const isEdditing = !!channel?.id;
    this.isSaving.set(true);

    this._httpService[isEdditing ? 'updateChannel' : 'addChannel'](this.form.value as ChannelModel).subscribe({
      next: (channel: ChannelModel) => {
        this._updateChannels(channel);
        this.resetForm();
        this._storage.showForm.set(false);
        this._snackBar.open('Channel saved successfully', null, SnackbarType.SUCCESS);
      },
      error: () => {
        this.form.updateValueAndValidity();
        this.isSaving.set(false);
        this._snackBar.open('Something went wrong', null, SnackbarType.ERROR);
      },
    });
  }

  resetForm(): void {
    this._storage.editingChannel.set(null);
    this.form.clearValidators();
    this._formDirective()?.resetForm(DefaultChannel);
  }

  closeForm() {
    this._storage.showForm.set(false);
  }

  copyToClipboard(value: string) {
    navigator.clipboard.writeText(value);
    this._snackBar.open('Copied to clipboard', null, SnackbarType.SUCCESS, 2000);
  }

  sendWebhook() {
    if (!this.form.value.webhookOverride?.length) return;
    this._httpService
      .sendWebhook(this.form.value.webhookOverride)
      .pipe(
        tap((response) => {
          const message = response.ok ? 'Webhook sent successfully.' : 'Failed to send webhook.';
          const type = response.ok ? SnackbarType.SUCCESS : SnackbarType.ERROR;
          this._snackBar.open(message, null, type);
        }),
        catchError(() => {
          this._snackBar.open('Failed to send webhook.', null, SnackbarType.ERROR);
          return of({ ok: false });
        }),
      )
      .subscribe();
  }

  /**
   * Control "required" validator for webhookOverride control\
   * Add/Remove validator if global webhook was added/deleted while editing/adding a channel
   */
  private _trackWebhook() {
    combineLatest([this.form.controls.notifyHA.valueChanges, this.globalWebhook$])
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        map(([_, globalWebhook]): boolean[] => [_, !globalWebhook?.length]),
      )
      .subscribe(([shouldNotify, shouldValidate]) => {
        this.form.controls.webhookOverride[shouldNotify ? 'enable' : 'disable']();
        this.form.controls.webhookOverride[shouldValidate && shouldNotify ? 'addValidators' : 'removeValidators']([
          Validators.required,
          YtValidators.url,
        ]);
        this.form.controls.webhookOverride.updateValueAndValidity();
      });
  }

  private _trackPollType() {
    this.form.controls.pollType.valueChanges
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        map((pollType) => pollType === PollType.INTERVAL),
      )
      .subscribe((isInterval) => {
        this.form.controls.pollInterval[isInterval ? 'addValidators' : 'removeValidators']([
          Validators.required,
          Validators.min(1),
          Validators.max(1440),
        ]);
        this.form.controls.pollTime[isInterval ? 'removeValidators' : 'addValidators']([Validators.required]);
        this.form.controls.pollInterval.updateValueAndValidity();
        this.form.controls.pollTime.updateValueAndValidity();
      });
  }

  private _trackChannel() {
    effect((): void => {
      // If the channel was deleted while editing, close the form
      const isChannelExists = !this._storage.channels().find((c) => c.id === this._storage.editingChannel()?.id);

      if (this._storage.editingChannel() && isChannelExists) {
        this.closeForm();
        return;
      }

      this._trackIsEditing();

      this.form.updateValueAndValidity();
    });
  }

  private _trackIsEditing() {
    // On channel edit, patch the form with the new values
    if (this._storage.editingChannel()) {
      this.form.patchValue(this._storage.editingChannel());
      this.form.addValidators(YtValidators.formChanged(this.form.value, equalJson));
      this._scrollToTop();
    } else {
      this.form.clearValidators();
      this.form.reset(DefaultChannel);
    }
  }

  private _trackType() {
    this.form.controls.type.valueChanges
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        tap((type) => {
          console.log(type);
          if (type === Types.AUDIO) {
            this.form.controls.codec.reset(null);
          } else this.form.controls.codec.enable();
        }),
      )
      .subscribe();
  }

  private _updateChannels(channel: ChannelModel) {
    if (this.isEditing()) {
      this._storage.channels.set(
        this._storage.channels().map((c) => (c.id === channel.id ? channel : c)) as ChannelModel[],
      );
    } else {
      this._storage.channels.set([...this._storage.channels(), channel] as ChannelModel[]);
    }
  }

  private _scrollToTop() {
    setTimeout(() => {
      if (this._formElRef()?.nativeElement) {
        this._formElRef().nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);
  }
}
