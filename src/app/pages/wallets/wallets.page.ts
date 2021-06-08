import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

import { CryptoWalletsService } from '../../services/crypto-wallets.service';
import { FiatWalletsService } from '../../services/fiat-wallets.service';
import { ProfileService } from '../../services/profile.service';
import { NotificationsService } from '../../services/notifications.service';
import { HelpersService } from '../../services/helpers.service';
import { Globals } from '../../services/globals.service';
import { PushNotificationService } from '../../services/push-notification.service';

@Component({
  selector: 'app-wallets',
  templateUrl: './wallets.page.html',
  styleUrls: ['./wallets.page.scss']
})
export class WalletsPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private profile: any;

  public disabledCreateFiatWallet: boolean;
  public wallets = [];
  public message: string;
  public title: string;
  public show: boolean;

  constructor(
    private fiatWalletsService: FiatWalletsService,
    private cryptoWalletsService: CryptoWalletsService,
    private profileService: ProfileService,
    private notifications: NotificationsService,
    private helpers: HelpersService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private globals: Globals,
    private translate: TranslateService,
    private storage: NativeStorage,
    private pushNotificationService: PushNotificationService,
  ) {
    this.translate.setDefaultLang(this.globals.language);

    this.disabledCreateFiatWallet = false;
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    this.getProfile(loading);
    this.getWallets(loading);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public currencyNameStyle(currencyName) {
    if (currencyName) {
      const _currencyName = currencyName.toLowerCase();
      return `wallet-currency-name-${_currencyName}`;
    }
  }

  public generateFiatWallet() {
    let isFullProfile = false;
    isFullProfile = this.checkProfileAttributes();

    if (isFullProfile) {
      return this.router.navigate(['/generate-fiat-wallet']);
    }
  }

  private checkProfileAttributes() {
    if (!this.profile.profile && !this.profile.documents) {
      this.router.navigate(['/update-profile']);
      return false;
    } else if (this.profile.profile && !this.profile.documents) {
      this.router.navigate(['/documents']);
      return false;
    } else if (this.profile.profile && this.profile.documents && !this.profile.kycVerification) {
      this.router.navigate(['/selfie']);
      return false;
    } else if (this.profile.complianceStatus === 'Rejected') {
      this.router.navigate(['/waiting-live-kyc']);
      return false;
    }

    return true;
  }

  public walletDetails(address: string, type: string, currencyCode: string) {
    if (type.includes('erc20')) {
      this.router.navigate([`/crypto-wallet-details`, { address: address, currencyCode: currencyCode }]);
    } else {
      this.router.navigate([`/${type}-wallet-details`, { address: address, currencyCode: currencyCode }]);
    }
  }

  public async refresh(refresher: any) {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    this.getProfile(loading);
    this.getWallets(loading);

    refresher.target.complete();
  }

  private getWallets(loading) {
    const requests = [
      this.cryptoWalletsService.getCryptoWallets(),
      this.fiatWalletsService.getFiatWallets()
    ];

    const subGetWallets = forkJoin(requests)
      .pipe(
        map((value: any) =>
          value
            .map(x => x.data)
            .reduce((acc, value) => {
              return [...acc, ...value];
            }, [])
        )
      )
      .subscribe(
        async (data) => {
          this.wallets = this.helpers.sort(data, 'currencyName');
          if (!this.wallets.length) {
            this.message =
              'Generate a wallet for the currency you need and use it to securely and conveniently manage your funds';
            this.title = 'There are no wallets on your list yet.';
            this.show = true;
          } else {
            this.show = false;
          }

          this.sort();
          await loading.dismiss();
        },
        (thrown: any) => {
          this.notifications.showNotification(thrown.error.message, 'error', loading);
        }
      );
    this.subs.push(subGetWallets);
    return subGetWallets;
  }

  private getProfile(loading) {
    const subGetProfile = this.profileService.getProfile().subscribe(
      async (data: any) => {
        await this.storage.setItem("profileType", data.data.profileType);
        this.profile = data.data;
        if (data.data.availableCurrencies.length) {
          this.disabledCreateFiatWallet = true;
        }
      },
      (thrown: any) => {
        this.notifications.showNotification(
          thrown.error.message,
          'error',
          loading
        );
      }
    );
    this.subs.push(subGetProfile);
  }

  private sort() {
    const currencyArrays = {};

    this.wallets.forEach(wallet => {
      if (currencyArrays[wallet.currencyName]) {
        currencyArrays[wallet.currencyName].push(wallet);
      } else {
        currencyArrays[wallet.currencyName] = [wallet];
      }
    });

    let array = [];

    for (const key in currencyArrays) {
      if (currencyArrays.hasOwnProperty(key)) {
        currencyArrays[key] = this.helpers.sortNumbers(
          currencyArrays[key],
          'balance'
        );
        if (array.length > 0) {
          Array.prototype.push.apply(array, currencyArrays[key]);
        } else {
          array = currencyArrays[key];
        }
      }
    }

    this.wallets = array;
  }
}
