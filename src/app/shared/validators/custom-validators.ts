import { AbstractControl, ValidatorFn, ValidationErrors, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import libphonenumber from 'google-libphonenumber';

export class CustomValidators {
  static passwordMatchValidator(controlNameToCompare: string): ValidatorFn {
    return (c: AbstractControl): ValidationErrors | null => {
      if (c.value === null || c.value.length === 0) {
        return null;
      }

      const controlToCompare = c.root.get(controlNameToCompare);
      if (controlToCompare) {
        const subscription: Subscription = controlToCompare.valueChanges.subscribe(() => {
          c.updateValueAndValidity();
          subscription.unsubscribe();
        });
      }
      return controlToCompare && controlToCompare.value !== c.value ? { 'compare': true } : null;
    }
  }

  static validCountryPhone(control: FormControl): ValidationErrors | null {
    let isValidNumber = false;

    try {
      const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
      const checkedNumber = phoneUtil.parse(control.value);
      isValidNumber = phoneUtil.isValidNumber(checkedNumber);
    } catch (e) {}

    return isValidNumber ? null : { phoneInvalid: true };
  }
}
