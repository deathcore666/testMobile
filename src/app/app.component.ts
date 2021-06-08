import { Component, NgZone, OnDestroy } from '@angular/core';
import { Platform, AlertController, NavController, ModalController, LoadingController } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { NFC } from '@ionic-native/nfc/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Router } from '@angular/router';

import { VerifyPage } from './pages/authorization/verify/verify.page';
import { ResetPasswordPage } from './pages/authorization/reset-password/reset-password.page';
import { ConfirmRegistrationPage } from './pages/authorization/confirm-registration/confirm-registration.page';
import { PurchaseDetailsPage } from './pages/transactions/purchase/purchase-details/purchase-details.page';

import { NotificationsService } from './services/notifications.service';
import { AuthorizationService } from './services/authorization.service';
import { PurchasesService } from './services/purchases.service';

import * as moment from 'moment';

import { environment } from '../environments/environment';
import { Globals } from './services/globals.service';
import { IsAccountApprovedGuard } from './guards/is-account-approved.guard';
import { WithdrawalService } from './services/withdrawal.service';
import { DepositService } from './services/deposit.service';
import { Subscription } from 'rxjs';
import { SelfiePage } from './pages/modals/selfie/selfie.page';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnDestroy {
  private subs: Subscription[] = [];
  public selectedTheme: string;
  private isAuthentiticated: boolean;

  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private deeplinks: Deeplinks,
    private apiService: ApiService,
    private nfc: NFC,
    private router: Router,
    private storage: NativeStorage,
    private alertCtrl: AlertController,
    private authorizationService: AuthorizationService,
    private notifications: NotificationsService,
    private purchasesService: PurchasesService,
    private zone: NgZone,
    private globals: Globals,
    private isAccountApprovedGuard: IsAccountApprovedGuard,
    private withdrawalService: WithdrawalService,
    private depositService: DepositService,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
  ) {
    this.selectedTheme = `${environment.WHITE_LABEL_THEME}`;
    this.initializeApp();
  }

  private initializeApp() {
    this.platform.ready().then(() => {
      const backSub = this.platform.backButton.subscribe(async (res) => {
        const url = this.router.url;
        let requestUrl;
        if (url.includes('/request-coins')) {
          requestUrl = url.split(';').shift();
          return requestUrl;
        }
        try {
          const modal = await this.modalCtrl.getTop();
          const alert = await this.alertCtrl.getTop();
          const loader = await this.loadingCtrl.getTop();
          if (modal) {
            return modal.dismiss();
          } else if (alert) {
            return alert.dismiss();
          } else if (loader) {
            return loader.dismiss();
          } else {
            if (url === '/wallets' || url === '/') {
              const alert = await this.alertCtrl.create({
                header: 'Are you sure you want to exit?',
                buttons: [
                  {
                    text: 'No',
                    handler: async () => {
                      await alert.dismiss();
                    }
                  },
                  {
                    text: 'Yes',
                    handler: async () => {
                      await this.storage.remove("token");
                      await this.storage.remove("expire_at");
                      navigator['app'].exitApp();
                    }
                  }
                ]
              });

              return await alert.present();
            } else if (url === '/exchange' || url === '/documents' || requestUrl === '/request-coins') {
              return;
            } else {
              this.navCtrl.back();
              return;
            }
          }
        } catch (error) { }
      });
      this.subs.push(backSub);

      if (this.platform.is('android') || environment.WHITE_LABEL_PLATFORM === 'coinexodeepp') {
        this.statusBar.styleLightContent();
      } else {
        this.statusBar.styleDefault();
      }

      this.setLanguage();
      const subDeepLinks = this.deeplinks.route({
        '/verify/:code': VerifyPage,
        '/reset-password/:token': ResetPasswordPage,
        '/confirm-registration/:token': ConfirmRegistrationPage,
        '/purchase-details/:id': PurchaseDetailsPage,
        '/profile/verification': SelfiePage,
      }).subscribe((match: any) => {
        if (match.$link.path === '/profile/verification') {
          this.zone.run(() => this.router.navigate(['/selfie']));
        } else {
          this.zone.run(() => this.router.navigate([match.$link.path]));
        }
      });
      this.subs.push(subDeepLinks);

      this.startNFC();
    });
  }

  private startNFC() {
    if (this.platform.is('android')) {
      this.nfc.enabled().then(() => {
        const subAddMimeType = this.nfc.addMimeTypeListener('text/coinoro').subscribe(async (data) => {
          let token, expireAt, isExpire;
          const passedData = JSON.parse(this.nfc.bytesToString(data.tag.ndefMessage[0].payload));

          try {
            token = await this.storage.getItem('token');
            expireAt = await this.storage.getItem('expire_at');
          } catch { }

          if (!token || !expireAt) {
            this.isAuthentiticated = false;
          } else {
            const expiration = moment(expireAt * 1000);

            isExpire = moment().isBefore(expiration);
          }

          this.isAuthentiticated = isExpire ? true : false;

          if (this.isAuthentiticated) {
            switch (passedData.type) {
              case 'withdrawal':
                this.assignWithdrawal(passedData.walletToken);
                break;
              case 'deposit':
                this.assignDeposit(passedData.walletToken);
                break;
              default:
                this.assignPurchase(passedData.walletToken);
                break;
            }
          } else {
            let email;

            try {
              email = await this.storage.getItem('email');
            } catch { }

            if (!email) {
              // In storage no user email => need login
              return this.showUnsignedAlert();
            }

            const subGetAuthType = this.authorizationService.getAuthType(email).subscribe(
              async (res: any) => {
                if (res.data === 'bio') {
                  // Authorization via face recognition
                  const subStartBio = this.authorizationService.startBioVerify(email).subscribe(
                    (result: any) => {
                      this.router.navigate(['/face-recognition', {
                        token: result.data.token,
                        task: 'verification',
                        confirmPurchaseToken: passedData.walletToken,
                        traits: result.data.traits,
                        url: result.data.returnUrl
                      }]);
                    },
                    (thrown) => {
                      this.notifications.showNotification(thrown.error.message, 'error');
                    }
                  );
                  this.subs.push(subStartBio);
                } else {
                  let pinCode;

                  try {
                    pinCode = await this.storage.getItem('pinCode');
                  } catch { }

                  if (pinCode) {
                    const data = {
                      event: 'signIn',
                      confirmToken: passedData.walletToken,
                      type: passedData.type
                    };

                    this.isAccountApprovedGuard.getToken(passedData.walletToken);
                    this.router.navigate(['/enter-password', { data: JSON.stringify(data) }]);
                  } else {
                    this.showWrongAuthMethodAlert();
                  }
                }
              },
              async (thrown) => {
                this.notifications.showNotification(thrown.error.message, 'error');
              });
            this.subs.push(subGetAuthType);
          }
        });
        this.subs.push(subAddMimeType);
      })
        .catch((error) => {
          if (error !== 'NO_NFC') {
            this.nfc.showSettings();
          }
        });
    }
  }

  public show() {
    let parsedUrl = this.router.url.substr(1);
    const cuttedUrl = parsedUrl.indexOf(';');

    parsedUrl = parsedUrl.substring(0, cuttedUrl != -1 ? cuttedUrl : parsedUrl.length);

    const showUrls = [
      'wallets',
      'exchange',
      'transactions',
      'requests',
      'requests/outcome-request',
      'requests/income-request',
      'transactions/outgoing',
      'transactions/incoming',
      'transactions/exchange',
      'transactions/purchase',
      'transactions/deposit',
      'transactions/withdrawal',
    ];

    for (let url of showUrls) {
      if (url === parsedUrl)
        return true;
    }
  }

  private async showUnsignedAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Unknown user.',
      message: `<p>You need to sign in at least once.<p>`,
      buttons: [
        {
          text: 'Logout',
          handler: () => {
            this.router.navigate(['/sign-in']);
          }
        },
        {
          text: 'Sign in',
          handler: async () => {
            this.router.navigate(['/sign-in']);
          }
        }
      ]
    });
    await alert.present();
  }

  private async showWrongAuthMethodAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Unsuitable authorization method.',
      message: `Your authorization method does not allow you to confirm the transaction. You need a fingerprint or confirmation by the person.`,
      buttons: [
        {
          text: 'Logout',
          handler: () => {
            this.router.navigate(['/sign-in']);
          }
        },
        {
          text: 'Sign in',
          handler: async () => {
            this.router.navigate(['/sign-in']);
          }
        }
      ]
    });
    await alert.present();
  }

  private async setLanguage() {
    try {
      const language = await this.storage.getItem('language');
      this.globals.language = language;
    } catch {
      await this.storage.setItem('language', 'en');
      this.globals.language = 'en';
    }
  }

  private assignWithdrawal(verifyToken) {
    const subAssignWithdrawal = this.withdrawalService.assignWithdrawal(verifyToken).subscribe(
      (res: any) => {
        this.router.navigate(['/confirm-withdrawal', { token: res.token }]);
      }, (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error');
      });
    this.subs.push(subAssignWithdrawal);
  }

  private assignDeposit(verifyToken) {
    const subAssignDeposit = this.depositService.assignDeposit(verifyToken).subscribe(
      (res: any) => {
        this.router.navigate(['/confirm-deposit', { token: res.token }]);
      }, (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error');
      });
    this.subs.push(subAssignDeposit);
  }

  private assignPurchase(verifyToken) {
    const subAssignPurchase = this.purchasesService.assignPurchase(verifyToken).subscribe(
      (res: any) => {
        this.router.navigate(['/confirm-purchase', { token: res.token, autoConfirm: true }]);
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error');
      });
    this.subs.push(subAssignPurchase);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }
}
