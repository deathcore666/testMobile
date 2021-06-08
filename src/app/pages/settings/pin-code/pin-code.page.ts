import { Component, OnInit, OnDestroy } from '@angular/core';

import { LoadingController, NavController } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Device } from '@ionic-native/device/ngx';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { AuthorizationService } from '../../../services/authorization.service';
import { NotificationsService } from '../../../services/notifications.service';
import { PurchasesService } from '../../../services/purchases.service';
import { SettingsService } from '../../../services/settings.service';
import { WithdrawalService } from '../../../services/withdrawal.service';
import { DepositService } from '../../../services/deposit.service';
import { Globals } from '../../../services/globals.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pin-code',
  templateUrl: './pin-code.page.html',
  styleUrls: ['./pin-code.page.scss'],
})

export class PinCodePage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private eventHandler: any;
  private oldPinCode: string;
  private newPin = '';
  private confirmNewPin = '';
  private confirmToken: string;
  private type: string;

  public pinCode = '';
  public event: any;
  public showNewPinCode: boolean;
  public showConfirmNewPinCode: boolean;
  public title: string;

  constructor(
    private storage: NativeStorage,
    private settingsService: SettingsService,
    private purchasesService: PurchasesService,
    private notifications: NotificationsService,
    private authorizationService: AuthorizationService,
    private faio: FingerprintAIO,
    private device: Device,
    private loadingCtrl: LoadingController,
    private router: Router,
    private navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private globals: Globals,
    private translate: TranslateService,
    private withdrawalService: WithdrawalService,
    private depositService: DepositService
  ) {
    this.translate.setDefaultLang(this.globals.language);
    
    this.eventHandler = {
      add: this.addPinCode.bind(this),
      change: this.changePinCode.bind(this),
      signIn: this.signInWithPinCode.bind(this),
      confirm: this.confirmPinCode.bind(this),
    };

    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      this.event = params.get('event');
      this.confirmToken = params.get('confirmToken');
      this.type = params.get('type');
    });
    this.subs.push(subRoute);
  }

  ngOnInit() {}

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async addNumber(number: string) {
    this.pinCode = this.pinCode.concat(number);

    if (this.event === 'change') {
      try {
        this.oldPinCode = await this.storage.getItem('pinCodeInput');
      } catch {}

      if (this.oldPinCode === this.pinCode) {
        if (this.showConfirmNewPinCode) {
          this.showNewPinCode = false;
          this.pinCode = '';
          return this.notifications.showNotification('Wrong code entered!', 'error');
        } else if (this.showNewPinCode) {
          this.pinCode = '';
          return this.notifications.showNotification(`Your new pin code shouldn't match the old one.`, 'error');
        }

        this.showNewPinCode = true;
        this.pinCode = '';
      } else if (this.showNewPinCode) {
        if (this.pinCode.length === 4) {
          this.newPin = this.pinCode;
          this.showNewPinCode = false;
          this.showConfirmNewPinCode = true;
          this.pinCode = '';
        }
      } else if (this.showConfirmNewPinCode && this.newPin.length === 4) {
        this.confirmNewPin = this.pinCode;
        if (this.confirmNewPin === this.newPin) {
          await this.eventHandler[this.event]();
        } else {
          if (this.pinCode === this.oldPinCode) {
            this.pinCode = '';
          }
          if (this.pinCode.length === 4) {
            await this.notifications.showNotification('Wrong code entered!', 'error');
            this.pinCode = '';
          }
        }
      } else {
        if (this.pinCode.length === 4) {
          this.pinCode = '';
          await this.notifications.showNotification('Wrong code entered!', 'error');
        }
      }
    } else if (this.pinCode.length === 4) {
      await this.eventHandler[this.event]();
    }
  }

  public delete() {
    this.pinCode = this.pinCode.substring(0, this.pinCode.length - 1);
  }

  public async cancel() {
    this.globals.hideFingerprint = true;
    this.storage.setItem('pinCode', false);
    this.navCtrl.back();
  }
  
  private async addPinCode() {
    let email;
    try {
      email = await this.storage.getItem('email');
    } catch {}
    const device = this.device.serial;

    const isAvailableFingerprint = await this.faio.isAvailable();

    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    if (isAvailableFingerprint) {
      const requestBody = {
        email: email,
        device: device,
        pinCode: this.pinCode
      };

      const subAdd = this.settingsService.addFingerprintAndPinCode(requestBody).subscribe(
        async (data: any) => {
          await this.storage.setItem('secret', data.data);
          await this.storage.setItem('pinCode', true);
          await this.storage.setItem('pinCodeInput', this.pinCode);
          await this.notifications.showNotification('Fingerprint and pin code successfully added.', 'success', loading);
          this.navCtrl.back();
        },
        async (thrown) => {
          await this.notifications.showNotification(thrown.error.message, 'error', loading);
        }
      );
      this.subs.push(subAdd);
    } else {
      const body = {
        pinCode: this.pinCode,
        device: device
      };

      const subAddPin = this.settingsService.addPinCode(body).subscribe(
        async (data: any) => {
          await this.storage.setItem('pinCode', true);
          await this.storage.setItem('pinCodeInput', this.pinCode);
          await this.notifications.showNotification(data.message, 'success', loading);

          this.navCtrl.back();
        },
        (thrown) => {
          this.notifications.showNotification(thrown.error.message, 'error', loading);
        }
      );
      this.subs.push(subAddPin);
    }
  }

  private async changePinCode() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const requestBody = {
      pinCode: this.pinCode,
      device: this.device.serial
    };

    const subAddPin = this.settingsService.addPinCode(requestBody).subscribe(
      async () => {
        await this.storage.setItem('pinCode', true);
        await this.storage.setItem('pinCodeInput', this.confirmNewPin);
        await this.notifications.showNotification('Pin code successfully changed!', 'success', loading);
        this.navCtrl.back();
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subAddPin);
  }

  private async signInWithPinCode() {
    let email;
    try {
      email = await this.storage.getItem('email');
    } catch {}

    const requestBody = {
      email: email,
      pinCode: this.pinCode,
      device: this.device.serial
    };

    const subSignInPin = this.authorizationService.signInWithPinCode(requestBody).subscribe(
      async (data: any) => {
        await this.storage.setItem('token', data.data.token);
        await this.storage.setItem('expire_at', data.data.expiration);
        await this.storage.setItem('acountAproved', true);

        if (this.confirmToken && this.confirmToken.length !== 0) {
          return this.confirmTransaction();
        }

        this.router.navigate(['/wallets'], { replaceUrl: true });
      }, async () => {
        this.pinCode = '';
        await this.notifications.showNotification('The code you entered is incorrect.', 'error');
      }
    );
    this.subs.push(subSignInPin);
  }

  private async confirmPinCode() {
    let email;
    try {
      email = await this.storage.getItem('email');
    } catch {}

    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const requestBody = {
      email: email,
      pinCode: this.pinCode,
      device: this.device.serial
    };

    const subConfirmPin = this.authorizationService.confirmPinCode(requestBody).subscribe(
      async (data: any) => {
        if (data.data === true) {
          await this.settingsService.clearFingerprint();
          await this.storage.setItem('pinCode', false);
        }

        await loading.dismiss();
        this.navCtrl.back();
      }, async () => {
        this.pinCode = '';
        await this.notifications.showNotification('The code you entered is incorrect.', 'error', loading);
      }
    );
    this.subs.push(subConfirmPin);
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
    const subAssignPurchase = this.purchasesService.assignPurchase(this.confirmToken).subscribe(
      (data: any) => {
        this.router.navigate(['/confirm-purchase', { token: data.token } ]);
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error');
      }
    );
    this.subs.push(subAssignPurchase);
  }

  private assignWithdrawal() {
    const subAssignWithdrawal = this.withdrawalService.assignWithdrawal(this.confirmToken).subscribe(
      (res: any) => {
        this.router.navigate(['/confirm-withdrawal', { token: res.token }]);
      }, (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error');
      }
    );
    this.subs.push(subAssignWithdrawal);
  }

  private assignDeposit() {
    const subAssignDeposit = this.depositService.assignDeposit(this.confirmToken).subscribe(
      (res: any) => {
        this.router.navigate(['/confirm-deposit', { token: res.token }]);
      }, (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error');
      }
    );
    this.subs.push(subAssignDeposit);
  }

}
