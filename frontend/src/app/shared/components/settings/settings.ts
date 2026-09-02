import { Component, inject, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatHint, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { NotifierService } from 'angular-notifier';
import { catchError, of, tap } from 'rxjs';
import { YtdlpValidatorDirective } from '../../directives';
import { equal } from '../../helpers';
import { PotStatusModel, SettingsFormModel, SettingsModel } from '../../models/settings.model';
import { HttpService, SnackbarService, SnackbarType, StorageService } from '../../services';
import { RtValidators } from '../../validators';

@Component({
  selector: 'rt-settings',
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatFormField,
    MatHint,
    MatIcon,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    YtdlpValidatorDirective,
    MatError,
    MatSuffix,
    MatTooltip,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  private readonly _fb = new FormBuilder();
  private readonly _httpService = inject(HttpService);
  private readonly _storage = inject(StorageService);
  private readonly _notifier = inject(NotifierService);
  private readonly _snackbar = inject(SnackbarService);

  closeDialog = output<void>();

  ytdlpVersion = signal<string | null>(null);
  isUpdating = signal(false);

  /**
   * Null until the check comes back, and stays hidden unless a provider is
   * actually configured — the POT provider is opt-in, so for most installs
   * there is nothing worth saying.
   */
  potStatus = signal<PotStatusModel | null>(null);

  form = this._fb.group<SettingsFormModel>({
    webhookUrl: this._fb.control('', { validators: [RtValidators.url] }),
    downloadsDir: this._fb.control('./'),
    cookiesPath: this._fb.control(''),
    ytdlpArgs: this._fb.control(''),
    ytdlpConcurrency: this._fb.control(2, {
      nonNullable: true,
      validators: [Validators.min(1), Validators.max(10)],
    }),
  });

  ngOnInit() {
    // this.trackAutoPaste();

    this._httpService.getSettings().subscribe((settings) => {
      this.form.patchValue(settings);
      this.form.addValidators(RtValidators.formChanged(this.form.value, equal));
      this.form.updateValueAndValidity();
    });

    this._loadVersion();
    this._loadPotStatus();
  }

  saveSettings() {
    this._httpService
      .saveSettings({ ...this._storage.settings(), ...this.form.value } as SettingsModel)
      .pipe(
        tap((settings: SettingsModel) => this._storage.settings.set(settings)),
        tap(() => this.closeDialog.emit()),
      )
      .subscribe({
        next: () => this._notifier.notify('success', 'Settings saved successfully.'),
        error: () => this._notifier.notify('error', 'Failed to save settings.'),
      });
  }

  updateYtdlp() {
    this.isUpdating.set(true);

    this._httpService
      .updateYtdlp()
      .pipe(
        catchError(() => of({ ok: false, from: null, to: null, output: 'Update request failed' })),
        tap(() => this.isUpdating.set(false)),
      )
      .subscribe((result) => {
        this.ytdlpVersion.set(result.to ?? result.from);

        if (!result.ok) {
          this._notifier.notify('error', `yt-dlp update failed: ${result.output.slice(0, 160)}`);
          return;
        }

        const message =
          result.from === result.to
            ? `yt-dlp is already up to date (${result.to}).`
            : `yt-dlp updated: ${result.from} → ${result.to}`;

        this._notifier.notify('success', message);
      });
  }

  sendWebhook() {
    if (!this.form.value.webhookUrl?.length) return;
    this._httpService
      .sendWebhook(this.form.value.webhookUrl)
      .pipe(
        tap((response) => {
          if (response.ok) {
            this._notifier.notify('success', 'Webhook sent successfully.', 'webhookOk');
            this._showPayloadExample();
          } else {
            this._notifier.notify('error', 'Failed to send webhook.');
          }
        }),
        catchError(() => {
          this._notifier.notify('error', 'Failed to send webhook.');
          return of({ ok: false });
        }),
      )
      .subscribe();
  }

  private _loadVersion() {
    this._httpService
      .getYtdlpVersion()
      .pipe(catchError(() => of({ version: null, available: false })))
      .subscribe((result) => this.ytdlpVersion.set(result.version));
  }

  private _loadPotStatus() {
    this._httpService
      .getPotStatus()
      .pipe(catchError(() => of(null)))
      .subscribe((status) => this.potStatus.set(status));
  }

  private _showPayloadExample() {
    this._snackbar.showWebhookDemo(SnackbarType.DARK, null);
  }
}
