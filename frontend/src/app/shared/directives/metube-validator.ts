import { Directive, inject } from '@angular/core';
import { AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, switchMap, take } from 'rxjs';
import { HttpService } from '../services';

@Directive({
  selector: '[ytMetubeValidator]',
  providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: MetubeValidatorDirective, multi: true }],
})
export class MetubeValidatorDirective implements AsyncValidator {
  private readonly _httpService = inject(HttpService);

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    if (control.errors) return of(control.errors);

    return control.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap((value) => this._httpService.validateMetube(value)),
      map((response) => (response.status ? null : { invalidMetubeUrl: true, message: 'Invalid MeTube URL' })),
      take(1), // complete so Angular knows this validation run is done
      catchError((error) => {
        console.error(error);
        return of({ invalidMetubeUrl: true, message: 'Invalid MeTube URL' });
      }),
    );
  }
}
