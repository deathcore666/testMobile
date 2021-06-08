import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { LoadingController, AlertController, NavController } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Router, ActivatedRoute } from '@angular/router';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { Device } from '@ionic-native/device/ngx';
import { TranslateService } from '@ngx-translate/core';

import { AuthorizationService } from '../../../services/authorization.service';
import { NotificationsService } from '../../../services/notifications.service';
import { PurchasesService } from '../../../services/purchases.service';
import { Globals } from '../../../services/globals.service';
import { WithdrawalService } from '../../../services/withdrawal.service';
import { DepositService } from '../../../services/deposit.service';
import { environment } from '../../../../environments/environment';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-enter-password',
  templateUrl: './enter-password.page.html',
  styleUrls: ['./enter-password.page.scss'],
})

export class EnterPasswordPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public signInForm: FormGroup;

  private hidePinCode;
  private userEmail: string;
  private confirmToken: string;
  private type: string;
  private translatedMessage: any;
  private from: string;

  constructor(
    private notifications: NotificationsService,
    private authorizationService: AuthorizationService,
    private purchasesService: PurchasesService,
    private loadingCtrl: LoadingController,
    private faio: FingerprintAIO,
    private device: Device,
    private storage: NativeStorage,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private globals: Globals,
    private translate: TranslateService,
    private zone: NgZone,
    private alertCtrl: AlertController,
    private withdrawalService: WithdrawalService,
    private depositService: DepositService,
    private formBuilder: FormBuilder,
    private navCtrl: NavController
  ) {

    this.signInForm = this.formBuilder.group({
      userPassword: [null, Validators.compose([Validators.required, Validators.minLength(7), Validators.maxLength(30)])]
    });

    const subTranslate = this.translate.getTranslation(this.globals.language).subscribe((messages: any) => {
      this.translatedMessage = messages;
    });
    this.subs.push(subTranslate);

    this.translate.setDefaultLang(this.globals.language);
    
    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      if (params.get("data")) {
        const data = JSON.parse(params.get("data"));
        this.confirmToken = data.confirmToken;
        this.type = data.type
      }

      this.hidePinCode = this.globals.hideFingerprint;
      this.from = params.get('from');
    });
    this.subs.push(subRoute);
  }

  async ngOnInit() {
    try {
      this.userEmail = await this.storage.getItem('email');
    } catch {}

    const subAuth = this.authorizationService.getAuthType(this.userEmail).subscribe(
      (data: any) => {
        if (data.data !== 'bio') {
          this.signWithFingerPrint();
        } else {
          this.signWithBio();
        }
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error');
      }
    );
    this.subs.push(subAuth);
  }

  ngOnDestroy() {
    this.globals.hideFingerprint = false;
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async clearAndSignIn() {
    if (this.from !== 'sign-in') {
      const alert = await this.alertCtrl.create({
        header: this.translatedMessage.settings.logout,
        message: this.translatedMessage.settings.logoutNotification,
        buttons: [
          {
            text: this.translatedMessage.common.cancel,
            handler: () => {}
          },
          {
            text: this.translatedMessage.settings.logout,
            handler: async () => {
              await this.storage.clear();
              this.zone.run(
                () => this.router.navigate(['/'], { replaceUrl: true })
              );
            }
          }
        ]
      })
  
      await alert.present();
    } else {
      this.navCtrl.back();
    }
  }

  public async signIn() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    let email;
    try {
      email = await this.storage.getItem('email');
    } catch (error) {
      console.log('error');
    }

    const requestBody = {
      email: email,
      password: this.signInForm.value.userPassword
    };

    const subSignIn = this.authorizationService.signIn(requestBody).subscribe(
      async () => {
        this.router.navigate(['/verify']);
        await loading.dismiss();
      },
      async (thrown) => {
        this.signInForm.reset();
        await this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subSignIn);
  }

  private signWithBio() {
    const subBio = this.authorizationService.startBioVerify(this.userEmail.trim()).subscribe(
      (res: any) => {
        this.router.navigate(['/face-recognition', {
          token: res.data.token,
          task: 'verification',
          traits: res.data.traits,
          url: res.data.returnUrl
        }]);
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error');
      }
    );
    this.subs.push(subBio);
  }

  private confirmTransaction() {
    switch (this.type) {
      case 'withdrawal':
        this.assignWithdrawal();
        break;
      case 'deposit':
        this.assignDeposit();
        break;
      default:
        this.assignPurchase();
        break;
    }
  }

  private assignPurchase() {
    const subPurchase = this.purchasesService.assignPurchase(this.confirmToken).subscribe(
      (data: any) => {
        this.router.navigate(['/confirm-purchase', { token: data.token } ]);
      },
      async thrown => {
        await this.notifications.showNotification(
          thrown.error.message,
          "error"
        );
      }
    );
    this.subs.push(subPurchase);
  }

  private assignWithdrawal() {
    const subWithdrawal = this.withdrawalService.assignWithdrawal(this.confirmToken).subscribe(
      (res: any) => {
        this.router.navigate(['/confirm-withdrawal', { token: res.token }]);
      }, (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error');
      }
    );
    this.subs.push(subWithdrawal);
  }

  private assignDeposit() {
    const subDeposit = this.depositService.assignDeposit(this.confirmToken).subscribe(
      (res: any) => {
        this.router.navigate(['/confirm-deposit', { token: res.token }]);
      }, (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error');
      }
    );
    this.subs.push(subDeposit);
  }

  private async signWithFingerPrint() {
    let pinCode;
    try {
      pinCode = await this.storage.getItem("pinCode");
    } catch {}

    if (pinCode) {
      // If user leave pin code page and want to sign in via email and password
      if (!this.hidePinCode) {
        this.faio
          .show({
            clientId: environment.FINGERPRINT_CLIENT,
            clientSecret: environment.FINGERPRINT_PASSWORD,
            disableBackup: true,
            localizedFallbackTitle: "Use Pin",
            localizedReason: "Please authenticate"
          })
          .then(async () => {
            let secret;

            try {
              secret = await this.storage.getItem("secret");
            } catch {}

            const loading = await this.loadingCtrl.create({
              spinner: "crescent"
            });
            const body = {
              secret: secret,
              accessKey: environment.FINGERPRINT_PASSWORD,
              device: this.device.serial
            };

            await loading.present();
            const subFingerprint = this.authorizationService.signInWithFingerprint(body).subscribe(
              async (response: any) => {
                await this.storage.setItem("token", response.data.token);
                await this.storage.setItem("secret", response.data.secret);
                await this.storage.setItem(
                  "expire_at",
                  response.data.expiration
                );
                await this.storage.setItem("acountAproved", true);
                await loading.dismiss();

                if (this.confirmToken && this.confirmToken.length !== 0) {
                  return this.confirmTransaction();
                } else {
                  this.router.navigate(["/wallets"]);
                }
              },
              async (thrown) => {
                await this.notifications.showNotification(
                  thrown.error.message,
                  "error",
                  loading
                );
              }
            );
            this.subs.push(subFingerprint);
          })
          .catch(() => {
            if (this.confirmToken) {
              this.router.navigate([
                "/pin-code",
                {
                  event: "signIn",
                  confirmToken: this.confirmToken,
                  type: this.type
                }
              ]);
            } else {
              this.router.navigate(["/pin-code", { event: "signIn" }]);
            }
          }
        );
      }
    }
  }

  public isControlStatus(controlName: string, status: string) {
    const control = this.signInForm.get(controlName);
    return control.dirty && control[status];
  }
}
