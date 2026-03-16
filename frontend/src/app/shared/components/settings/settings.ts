import { Component, inject, OnInit, output } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatHint, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { catchError, of, tap } from 'rxjs';
import { MetubeValidatorDirective } from '../../directives';
import { equal } from '../../helpers';
import { SettingsFormModel, SettingsModel } from '../../models/settings.model';
import { HttpService, SnackbarService, SnackbarType, StorageService } from '../../services';
import { YtValidators } from '../../validators';

@Component({
  selector: 'yt-settings',
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
    MetubeValidatorDirective,
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
  private readonly _snackBar = inject(SnackbarService);

  closeDialog = output<void>();
  form = this._fb.group<SettingsFormModel>({
    metubeUrl: this._fb.control('', { validators: [Validators.required, YtValidators.url] }),
    webhookUrl: this._fb.control('', { validators: [YtValidators.url] }),
  });

  ngOnInit() {
    this._httpService.getSettings().subscribe((settings) => {
      this.form.patchValue(settings);
      this.form.addValidators(YtValidators.formChanged(this.form.value, equal));
      this.form.updateValueAndValidity();
    });
  }

  saveSettings() {
    this._httpService
      .saveSettings({ ...this._storage.settings(), ...this.form.value })
      .pipe(
        tap((settings: SettingsModel) => this._storage.settings.set(settings)),
        tap(() => this.closeDialog.emit()),
      )
      .subscribe({
        next: () => this._snackBar.open('Settings saved successfully.', null, SnackbarType.SUCCESS),
        error: () => this._snackBar.open('Failed to save settings.', null, SnackbarType.ERROR),
      });
  }

  sendWebhook() {
    if (!this.form.value.webhookUrl?.length) return;
    this._httpService
      .sendWebhook(this.form.value.webhookUrl)
      .pipe(
        tap((response) => {
          if (response.ok) {
            this._snackBar.open('Webhook sent successfully.', null, SnackbarType.SUCCESS);
          } else {
            this._snackBar.open('Failed to send webhook.', null, SnackbarType.ERROR);
          }
        }),
        catchError(() => {
          this._snackBar.open('Failed to send webhook.', null, SnackbarType.ERROR);
          return of({ ok: false });
        }),
      )
      .subscribe();
  }
}
