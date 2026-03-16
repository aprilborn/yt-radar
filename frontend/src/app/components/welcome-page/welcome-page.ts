import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatInput } from '@angular/material/input';
import { delay, filter, finalize, switchMap, take } from 'rxjs';
import { MetubeValidatorDirective } from '../../shared/directives';
import { clearTextEffect, textWriterEffect } from '../../shared/helpers';
import { YtValidators } from '../../shared/validators';
import { Router } from '@angular/router';
import { HttpService, SnackbarService, SnackbarType, StorageService } from '../../shared/services';

@Component({
  selector: 'yt-welcome-page',
  templateUrl: 'welcome-page.html',
  styleUrl: './welcome-page.css',
  imports: [AsyncPipe, MatIcon, MatFormField, ReactiveFormsModule, MatInput, MetubeValidatorDirective, MatError],
})
export class WelcomePage implements OnInit {
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _router = inject(Router);
  private readonly _httpService = inject(HttpService);
  private readonly _storage = inject(StorageService);
  private readonly _snackBar = inject(SnackbarService);
  private readonly _exampleUrl = 'http(s)://metube:30094';

  inputRef = viewChild<ElementRef<HTMLInputElement>>('inputURL');
  page = viewChild<ElementRef<HTMLDivElement>>('page');
  matcher = new MyErrorStateMatcher();
  metubeControl = new FormControl<string>('', {
    validators: [Validators.required, YtValidators.url],
    updateOn: 'change',
  });
  message$ = textWriterEffect('Please enter your MeTube URL').pipe(delay(2000));
  example$ = textWriterEffect(this._exampleUrl).pipe(
    delay(5000),
    finalize(() => this._clearText()),
  );

  ngOnInit() {
    this._httpService.getSettings().subscribe();

    this._onSuccess().subscribe({
      next: () =>
        setTimeout(() =>
          this._router.navigate(['/channels']).then(() => {
            this._snackBar.open('MeTube URL saved successfully.', null, SnackbarType.SUCCESS);
            setTimeout(
              () => this._snackBar.open('You can now start creating watchers.', null, SnackbarType.SUCCESS),
              3000,
            );
            setTimeout(() => this._snackBar.open('Have fun!', null, SnackbarType.SUCCESS), 6000);
          }),
        ),
      error: () => this.metubeControl.setErrors({ invalidMetubeUrl: true }),
    });
  }

  focusInput() {
    this.inputRef()?.nativeElement.focus();
  }

  private _clearText() {
    setTimeout(() => {
      this._cdr.markForCheck();
      this.example$ = clearTextEffect(this._exampleUrl).pipe(finalize(() => this.focusInput()));
    }, 500);
  }

  private _onSuccess() {
    return this.metubeControl.statusChanges.pipe(
      filter(() => this.metubeControl.valid && !!this.metubeControl.value),
      take(1),
      switchMap(() =>
        this._httpService.saveSettings({
          enabled: true,
          webhookUrl: this._storage.settings().webhookUrl ?? '',
          metubeUrl: this.metubeControl.value,
        }),
      ),
    );
  }
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
