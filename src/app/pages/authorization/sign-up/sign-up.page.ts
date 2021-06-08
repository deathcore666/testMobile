import { Component, OnDestroy } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Router } from '@angular/router';

import { AuthorizationService } from '../../../services/authorization.service';
import { NotificationsService } from '../../../services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../../services/globals.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidators } from '../../../shared/validators/custom-validators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})

export class SignUpPage implements OnDestroy {
  public customAlertOptions: any = {
    header: 'Account Type',
  };
  private subs: Subscription[] = [];
  public signUpForm: FormGroup;
  public customPatterns = {
    V: { pattern: new RegExp("[A-Z,a-z]") },
    0: { pattern: new RegExp("[0-9]") },
  };

  constructor(
    private router: Router,
    private notifications: NotificationsService,
    private authorizationService: AuthorizationService,
    private loadingCtrl: LoadingController,
    private storage: NativeStorage,
    private translate: TranslateService,
    private globals: Globals,
    private formBuilder: FormBuilder
  ) {
    this.signUpForm = this.formBuilder.group({
      email: [null, Validators.compose([Validators.required, Validators.email])],
      phone: ['', Validators.compose([
        Validators.required,
        Validators.minLength(7),
        Validators.maxLength(21),
        Validators.pattern('\\+[0-9 ]+'),
        CustomValidators.validCountryPhone
      ])],
      password: [null, Validators.compose([
        Validators.required,
        Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{0,}$"),
        Validators.minLength(7), Validators.maxLength(30)
      ])],
      confirmPassword: [null, Validators.compose([Validators.required, CustomValidators.passwordMatchValidator('password')])],
      accountType: [null, Validators.required],
      coupon: [null, Validators.compose([Validators.minLength(7)])]
    });

    this.translate.setDefaultLang(this.globals.language);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async signUp() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();
    const form = this.signUpForm.value;

    const requestBody = {
      email: form.email,
      password: form.password,
      phone: form.phone,
      accountType: form.accountType,
      coupon: form.coupon
    };

    if (!form.coupon) {
      delete requestBody.coupon;
    }

    const subSignUp = this.authorizationService.signUp(requestBody).subscribe(
      async (data: any) => {
        await this.storage.setItem('email', form.email);

        this.notifications.showNotification(data.message, 'success', loading);
        this.signUpForm.reset();
        this.router.navigate(['/sign-in']);
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subSignUp);
  }

  public isControlStatus(controlName: string, status: string) {
    const control = this.signUpForm.get(controlName);
    return control.dirty && control[status];
  }

  public updateToUpperCase(event) {
    this.signUpForm.get('coupon').patchValue(event.target.value.toUpperCase());
  }
}
