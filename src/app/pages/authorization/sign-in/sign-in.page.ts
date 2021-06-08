import { Component, OnDestroy } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Router } from '@angular/router';

import { AuthorizationService } from '../../../services/authorization.service';
import { NotificationsService } from '../../../services/notifications.service';
import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})

export class SignInPage implements OnDestroy {
  private subs: Subscription[] = [];
  public signInForm: FormGroup;

  constructor(
    private notifications: NotificationsService,
    private authorizationService: AuthorizationService,
    private loadingCtrl: LoadingController,
    private storage: NativeStorage,
    private router: Router,
    private globals: Globals,
    private translate: TranslateService,
    private formBuilder: FormBuilder
  ) {
    this.translate.setDefaultLang(this.globals.language);

    this.signInForm = this.formBuilder.group({
      userEmail: [null, Validators.compose([Validators.required, Validators.email])]
    });
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async signIn() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const email = this.signInForm.value.userEmail;

    const subAuth = this.authorizationService.getAuthType(email).subscribe(async (data: any) => {
      await this.storage.setItem('email', email);
      await loading.dismiss();

      if (data.data === 'bio') {
        this.authorizationService.startBioVerify(email).subscribe(
          async (response: any) => {
            this.router.navigate(['face-recognition', {
              token: response.data.token,
              task: 'verification',
              traits: response.data.traits,
              url: response.data.returnUrl
            }]);
          },
          (thrown) => {
            this.notifications.showNotification(thrown.error.message, 'error', loading);
          }
        );
      } else {
        this.router.navigate(['/enter-password', { from: 'sign-in' }]);
      }
    },
    (thrown) => {
      this.notifications.showNotification(thrown.error.message, 'error', loading);
    });
    this.subs.push(subAuth);
  }

  public isControlStatus(controlName: string, status: string) {
    const control = this.signInForm.get(controlName);
    return control.dirty && control[status];
  }
}
