import { Component, OnDestroy } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';

import { AuthorizationService } from '../../../services/authorization.service';
import { NotificationsService } from '../../../services/notifications.service';
import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnDestroy {
  private subs: Subscription[] = [];
  public forgotPassForm: FormGroup;

  constructor(
    private notifications: NotificationsService,
    private authorizationService: AuthorizationService,
    private loadingCtrl: LoadingController,
    private globals: Globals,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private navCtrl: NavController
  ) {
    this.translate.setDefaultLang(this.globals.language);

    this.forgotPassForm = this.formBuilder.group({
      email: [null, Validators.compose([Validators.required, Validators.email])]
    });
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async sendEmail() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const email = this.forgotPassForm.value.email;

    const subForgotPass = this.authorizationService.forgotPassword(email).subscribe(
      (data: any) => {
        this.notifications.showNotification(data.message, 'success', loading);
        this.forgotPassForm.reset();
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
        this.forgotPassForm.reset();
      }
    );
    this.subs.push(subForgotPass);
  }

  public isControlStatus(controlName: string, status: string) {
    const control = this.forgotPassForm.get(controlName);
    return control.dirty && control[status];
  }

  public goBack() {
    this.navCtrl.back();
  }
}
