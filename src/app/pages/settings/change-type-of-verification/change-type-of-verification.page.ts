import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Clipboard } from '@ionic-native/clipboard/ngx';

import { SettingsService } from '../../../services/settings.service';
import { NotificationsService } from '../../../services/notifications.service';
import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-type-of-verification',
  templateUrl: './change-type-of-verification.page.html',
  styleUrls: ['./change-type-of-verification.page.scss'],
})
export class ChangeTypeOfVerificationPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public verificationTypes = [
    { name: 'Email verification (by default)', value: 'email' },
    { name: 'SMS verification', value: 'phone' },
    { name: 'Google verification', value: 'google' }
  ];

  public choosenType: any;
  public showPhoneInput = false;
  public disableButton = true;
  public phone: string;
  public hideGoogleAuthenticator = false;

  public otpSecretCode: string;
  public otpCode: string;

  constructor(
    private settingsService: SettingsService,
    private notifications: NotificationsService,
    private router: Router,
    private clipboard: Clipboard,
    private globals: Globals,
    private translate: TranslateService,
    private navCtrl: NavController
  ) {
    this.translate.setDefaultLang(this.globals.language);
  }

  ngOnInit() {
    this.getUserSettings();
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public typeChanged() {
    this.disableButton = false;

    if (this.choosenType === 'google') {
      this.hideGoogleAuthenticator = false;
    } else {
      this.hideGoogleAuthenticator = true;
      this.otpSecretCode = '';
    }

    if (this.choosenType === 'email' || this.choosenType === 'google' || this.choosenType === 'bio') {
      this.showPhoneInput = false;
    } else if (this.choosenType === 'phone') {
      this.showPhoneInput = true;
    }
  }

  public async chooseType() {
    if (this.choosenType === 'phone' && this.phone.length < 1) {
      this.notifications.showNotification('Please, enter your phone number', 'error');
      return;
    }

    if (this.choosenType === 'bio') {
      this.disableButton = true;

      const subBio = this.settingsService.bioEnroll().subscribe(
        (data: any) => {
          this.router.navigate(['/face-recognition', {
            token: data.data.token,
            task: 'enrollment',
            traits: data.data.traits,
            url: data.data.returnUrl
          }]);

          this.disableButton = false;
        },
        (thrown) => {
          this.disableButton = false;
          this.notifications.showNotification(thrown.error.message, 'error');
        }
      );
      this.subs.push(subBio);
      return;
    }

    this.disableButton = true;

    let requestBody = {};
    if (this.choosenType === 'phone') {
      requestBody = {
        ... (this.phone && {phone: this.phone})
      };
    }

    const subChangeType = this.settingsService.changeTypeOfVerification(this.choosenType, requestBody).subscribe(
      (data: any) => {
        if (this.choosenType !== 'google') {
          this.notifications.showNotification(data.message, 'success');
        }

        if (this.choosenType === 'google' && data.data) {
          this.notifications.showNotification('Please, enter your OTP code', 'success');
          this.otpSecretCode = data.data;
        }
        this.disableButton = true;
      },
      (thrown) => {
        this.disableButton = false;
        this.notifications.showNotification(thrown.error.message, 'error');
      }
    );
    this.subs.push(subChangeType);
  }

  public confirmGoogleAuth() {
    const subConfirmGoogle = this.settingsService.confirmGoogleAuth(this.otpCode).subscribe(
      (data: any) => {
        this.notifications.showNotification(data.message, 'success');
        this.otpSecretCode = '';
        this.otpCode = '';
        this.disableButton = true;
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error');
      }
    );
    this.subs.push(subConfirmGoogle);
  }

  public successCopy(text: string) {
    this.clipboard.copy(text);
    this.notifications.showNotification('Copied to clipboard', 'success');
  }

  private getUserSettings() {
    const subGetUserSetting = this.settingsService.getUserSettings().subscribe(
      (data: any) => {
        this.choosenType = data.data.authType;

        if (data.data.phone) {
          this.phone = data.data.phone;
        }

        if (this.choosenType === 'phone') {
          this.showPhoneInput = true;
        }
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error');
      }
    );
    this.subs.push(subGetUserSetting);
  }

  public goBack() {
    this.navCtrl.back();
  }
}
