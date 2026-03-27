import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export class YtValidators {
  static formChanged<T>(sourceValue: T, compareFn: (source: T, formValue: T) => boolean): ValidatorFn {
    const compareWith: T = window.structuredClone(sourceValue);
    return ((form: FormGroup): ValidationErrors =>
      compareFn(form.value, compareWith) ? { unchanged: true } : null) as ValidatorFn;
  }

  static url(control: AbstractControl): ValidationErrors | null {
    const url = control.value;
    if (!url) return null;
    if (!url.startsWith('http://') && !url.startsWith('https://'))
      return { invalidUrl: true, message: 'URL must start with http:// or https://' };
    return null;
  }
}
