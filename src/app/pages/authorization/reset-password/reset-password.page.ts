import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthorizationService } from '../../../services/authorization.service';
import { NotificationsService } from '../../../services/notifications.service';
import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '../../../shared/validators/custom-validators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})

export class ResetPasswordPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public resetPasswordForm: FormGroup;
  private token: string;

  constructor(
    private notifications: NotificationsService,
    private authorizationService: AuthorizationService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private globals: Globals,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private navCtrl: NavController
  ) {
    this.translate.setDefaultLang(this.globals.language);

    this.resetPasswordForm = this.formBuilder.group({
      password: [null, Validators.compose([
        Validators.required,
        Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{0,}$"),
        Validators.minLength(7),
        Validators.maxLength(30)
      ])],
      confirmPassword: [null, Validators.compose([Validators.required, CustomValidators.passwordMatchValidator('password')])]
    });
  }

  ngOnInit() {
    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      this.token = params.get('token');
    });
    this.subs.push(subRoute);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async sendPassword() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const password = this.resetPasswordForm.value.password;

    const requestBody = {
      password: password,
      token: this.token
    };

    const subResetPass = this.authorizationService.resetPassword(requestBody).subscribe(
      async (res: any) => {
        await loading.dismiss();
        this.router.navigate(['/sign-in']);
        this.notifications.showNotification(res.message, 'success', loading);
      },
      (thrown) => {
        this.resetPasswordForm.reset();
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subResetPass);
  }

  public isControlStatus(controlName: string, status: string) {
    const control = this.resetPasswordForm.get(controlName);
    return control.dirty && control[status];
  }

  public goBack() {
    this.navCtrl.back();
  }
}
