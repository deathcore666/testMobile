import { Component, OnInit, OnDestroy } from '@angular/core';

import { SettingsService } from '../../../services/settings.service';
import { NotificationsService } from '../../../services/notifications.service';
import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '../../../shared/validators/custom-validators';
import { Subscription } from 'rxjs';
import { NavController } from '@ionic/angular';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit, OnDestroy {
  private susb: Subscription[] = [];
  public userSettings: any;
  public changePassForm: FormGroup;
  public showLoading: boolean;

  constructor(
    private settingsService: SettingsService,
    private notifications: NotificationsService,
    private globals: Globals,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private navCtrl: NavController
  ) {
    this.translate.setDefaultLang(this.globals.language);

    this.changePassForm = this.formBuilder.group({
      oldPassword: [null, Validators.compose([Validators.required, Validators.minLength(7), Validators.maxLength(30)])],
      newPassword: [null, Validators.compose([
        Validators.required,
        Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{0,}$"),
        Validators.minLength(7),
        Validators.maxLength(30)
      ])],
      confirmPassword: [null, Validators.compose([Validators.required, CustomValidators.passwordMatchValidator('newPassword')])]
    })
  }

  ngOnInit() {
    this.getUserSettings();
  }

  ngOnDestroy() {
    for (let sub of this.susb) {
      sub.unsubscribe();
    }
  }

  public async changePassword() {
    this.showLoading = true;
    const form = this.changePassForm.value;

    const requestBody = {
      oldPassword: form.oldPassword,
      newPassword: form.newPassword
    };

    const subChangePass = this.settingsService.changePassword(requestBody).pipe(
      take(1)
    ).subscribe(
      async (data: any) => {
        this.showLoading = false;
        this.changePassForm.reset();
        await this.notifications.showNotification(data.message, 'success');
      },
      async (thrown) => {
        this.showLoading = false;
        await this.notifications.showNotification(thrown.error.message, 'error');
      }
    );
    this.susb.push(subChangePass);
  }

  private getUserSettings() {
    const subGetUserSetting = this.settingsService.getUserSettings().subscribe(
      (data: any) => {
        this.userSettings = data.data;
      },
      async (thrown) => {
        await this.notifications.showNotification(thrown.error.message, 'error');
      }
    );
    this.susb.push(subGetUserSetting);
  }

  public isControlStatus(controlName: string, status: string) {
    const control = this.changePassForm.get(controlName);
    return control.dirty && control[status];
  }

  public goBack() {
    this.navCtrl.back();
  }
}
