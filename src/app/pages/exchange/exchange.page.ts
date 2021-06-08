import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController, AlertController, Platform, NavController } from '@ionic/angular';

import { CurrencyService } from '../../services/currency.service';
import { CryptoWalletsService } from '../../services/crypto-wallets.service';
import { FiatWalletsService } from '../../services/fiat-wallets.service';
import { ProfileService } from '../../services/profile.service';
import { ExchangeService } from '../../services/exchange.service';
import { HelpersService } from '../../services/helpers.service';
import { NotificationsService } from '../../services/notifications.service';

import { Subject, forkJoin, Subscription, from } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, mergeMap } from 'rxjs/operators';
import { SearchbarModalComponent } from '../../shared/searchbar-modal/searchbar-modal.component';
import { Globals } from '../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { NoAvailableExchangeComponent } from './no-available-exchange/no-available-exchange.component';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.page.html',
  styleUrls: ['./exchange.page.scss']
})

export class ExchangePage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private profile: any;
  public amountSubscriber = new Subject<string>();

  public translatedMessages: any;
  public step = 1;

  public currenciesList: any[];

  public exchangedCurrency: any;
  public exchangedAmount: number;
  public receivedCurrency: any;
  public receivedAmount: any;

  public exchangedWalletList: any[];
  public exchangedWallet: any;

  public receivedWalletList: any[];
  public receivedWallet: any;

  public showMessage = false;
  public missedWalletName: string;

  public successExchange: boolean;
  public showExchangeResult = false;

  private usingService: any;
  private availableCurrencies: [];

  constructor(
    private router: Router,
    private notifications: NotificationsService,
    private loadingCtrl: LoadingController,
    private currencyService: CurrencyService,
    private cryptoWalletsService: CryptoWalletsService,
    private fiatWalletsService: FiatWalletsService,
    private profileService: ProfileService,
    private exchangeService: ExchangeService,
    private helpers: HelpersService,
    private modalController: ModalController,
    private alertCtrl: AlertController,
    private globals: Globals,
    private translate: TranslateService,
    private platform: Platform,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
  ) {
    const subTranslation = this.translate.getTranslation(this.globals.language).subscribe((messages: any) => {
      this.translatedMessages = messages;
    });
    this.subs.push(subTranslation);

    this.translate.setDefaultLang(this.globals.language);

    this.usingService = {
      fiat: this.fiatWalletsService,
      crypto: this.cryptoWalletsService,
      erc20token: this.cryptoWalletsService
    };

    const subAmouns = this.amountSubscriber
      .pipe(
        map((event: any) => event.target.value),
        debounceTime(1200),
        distinctUntilChanged()
      )
      .subscribe(async () => {
        await this.getReceivedAmount();
      });
    this.subs.push(subAmouns);
  }

  ngOnInit() {
    this.getCurrencies();
    this.getAvailableWallets();
    const backSub = this.platform.backButton.subscribe(async () => {
      try {
        const modal = await this.modalController.getTop();
        const alert = await this.alertCtrl.getTop();
        if (modal || alert) {
          modal.dismiss();
          alert.dismiss();
          return;
        } else if (this.step === 1) {
          this.navCtrl.back();
        } else {
          return this.step = 1;
        }
      } catch (error) { }
    });
    this.subs.push(backSub);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public next() {
    this.showExchangeResult = false;
    this.step += 1;

    if (this.step === 2) {
      this.getWallets();
    } else if (this.step === 3) {
      if (this.showMessage) {
        this.generateWallet();
      } else {
        const exchangeDetails = {
          exchangedAddress: this.exchangedWallet.address,
          receivedAddress: this.receivedWallet.address,
          exchangedCurrency: this.exchangedCurrency.code,
          receivedCurrency: this.receivedCurrency.code,
          amount: this.exchangedAmount
        };

        this.createExchange(exchangeDetails);
      }
    }
  }

  public previous() {
    this.exchangedWalletList = null;
    this.receivedWalletList = null;
    this.exchangedWallet = null;
    this.receivedWallet = null;

    this.showMessage = false;
    this.missedWalletName = null;

    this.step -= 1;
  }

  public chooseCurrency() {
    if (this.exchangedCurrency.code !== this.receivedCurrency.code) {
      this.getReceivedAmount();
    } else {
      if (this.exchangedCurrency && this.receivedCurrency) {
        this.notifications.showNotification('pleaseSelectDiffCurrencies', 'error');

        this.receivedCurrency = null;
        this.receivedAmount = null;
        return;
      }
    }
  }

  public async openCurrenciesModal(from) {
    const componentProps = {
      array: this.currenciesList,
      title: 'Choose currency',
      from: from,
      item: {
        exchangedCurrency: null,
        receivedCurrency: null
      },
      availableCurr: null
    };

    if (from === 'exchangeFrom') {
      componentProps.availableCurr = this.availableCurrencies;
    }

    if (from === 'exchangeTo' && this.exchangedCurrency.code === 'USDC') {
      componentProps.array = this.currenciesList.filter((currency: any) => {
        return environment.USDC_COMPATIBLE_CURRENCIES.includes(currency.code);
      });
    }
    
    if (from === 'exchangeTo' && this.exchangedCurrency.code !== 'USDC') {
      environment.USDC_COMPATIBLE_CURRENCIES.includes(this.exchangedCurrency.code)
        ? componentProps.array = componentProps.array
        : componentProps.array = this.currenciesList.filter((currency: any) => currency.code !== 'USDC');
    }

    const modal = await this.modalController.create({
      component: SearchbarModalComponent,
      componentProps: { componentProps },
      backdropDismiss: false,
      animated: true,
      showBackdrop: true,
      cssClass: 'searchbar-modal'
    });

    await modal.present();
    await this.alertCtrl.dismiss();

    const { data } = await modal.onWillDismiss();

    if (data) {
      if (data.from === 'exchangeFrom') {
        this.exchangedCurrency = data.exchangedCurrency;
      } else {
        this.receivedCurrency = data.receivedCurrency;
      }
    }

    if (this.exchangedCurrency && this.receivedCurrency) {
      this.chooseCurrency();
    }
  }

  private reset() {
    this.step = 1;

    this.exchangedCurrency = null;
    this.receivedCurrency = null;
    this.exchangedAmount = null;
    this.receivedAmount = null;

    this.exchangedWalletList = null;
    this.receivedWalletList = null;
    this.exchangedWallet = null;
    this.receivedWallet = null;

    this.showMessage = false;
    this.missedWalletName = null;
  }

  private async getCurrencies() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subCurrencies = this.currencyService.getCurrencies().subscribe(
      async (res: any) => {
        this.currenciesList = res.data;
        await loading.dismiss();
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subCurrencies);
  }

  private async getReceivedAmount() {
    if (!this.exchangedAmount) {
      this.receivedAmount = null;
    }

    if (
      this.exchangedAmount > 0 &&
      this.exchangedCurrency &&
      this.receivedCurrency
    ) {
      const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
      await loading.present();

      const amount = this.exchangedCurrency.type === 'fiat' ?
        Number(this.exchangedAmount.toFixed(2)) :
        Number(this.exchangedAmount.toFixed(8));

      const subSpread = this.exchangeService.getSpreadAmount(
        this.exchangedCurrency.code,
        this.receivedCurrency.code,
        amount
      ).subscribe(
        async (res: any) => {
          if (res.firstAvailableConversionDate) {
            const data = {
              exchangedCurrency: this.exchangedCurrency,
              receivedCurrency: this.receivedCurrency,
              availableDate: res.firstAvailableConversionDate
            }

            this.exchangedAmount = null;
            this.receivedAmount = null;
            this.openNoAvailableModal(data);
          } else {
            this.receivedAmount = res.data.receivedAmount;
          }
          await loading.dismiss();
        },
        (thrown) => {
          this.exchangedAmount = null;
          this.receivedAmount = null;
          this.notifications.showNotification(thrown.error.message, 'error', loading);
        }
      );
      this.subs.push(subSpread);
    }
  }

  private async getWallets() {
    const executeCheckReceivedWallet = await this.getExchangedWallets();

    if (executeCheckReceivedWallet) {
      await this.getReceivedWallets();
    }
  }

  private generateWallet() {
    const walletName = `${this.receivedCurrency.code} exchange wallet`;

    const requestBody = {
      currencyCode: this.receivedCurrency.code,
      name: walletName
    };

    if (this.receivedCurrency.type === 'crypto') {
      const subGenerateCrypto = this.cryptoWalletsService.generateCryptoWallet(requestBody).subscribe(
        (res: any) => {
          const exchangeDetails = {
            exchangedAddress: this.exchangedWallet.address,
            receivedAddress: res.data.address,
            exchangedCurrency: this.exchangedCurrency.code,
            receivedCurrency: res.data.currencyCode,
            amount: this.exchangedAmount
          };

          this.createExchange(exchangeDetails);
        },
        (thrown) => {
          this.notifications.showNotification(thrown.error.message, 'error');
          this.reset();
        }
      );
      this.subs.push(subGenerateCrypto);
    }

    if (this.receivedCurrency.type === 'fiat') {
      const data = {
        currencyCode: this.receivedCurrency.code,
        name: walletName
      };

      const subGenerateFiat = this.fiatWalletsService.generateFiatWallet(data).subscribe(
        (res: any) => {
          const exchangeDetails = {
            exchangedAddress: this.exchangedWallet.address,
            receivedAddress: res.data.address,
            exchangedCurrency: this.exchangedCurrency.code,
            receivedCurrency: this.receivedCurrency.code,
            amount: this.exchangedAmount
          };

          this.createExchange(exchangeDetails);
        },
        (thrown) => {
          this.notifications.showNotification(thrown.error.message, 'error');
          this.reset();
        }
      );
      this.subs.push(subGenerateFiat);
    }
  }

  private async createExchange(exchangeDetails) {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subExchange = this.exchangeService.createExchange(exchangeDetails).subscribe(
      async () => {
        await loading.dismiss();
        this.showExchangeResult = true;
        this.successExchange = true;
        this.exchangedCurrency = null;
        this.receivedCurrency = null;
        this.exchangedAmount = null;
        this.receivedAmount = null;
      },
      (thrown) => {
        this.successExchange = false;
        this.showExchangeResult = true;
        this.reset();
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subExchange);
  }

  private async getExchangedWallets() {
    const subGetWallet = this.usingService[this.exchangedCurrency.type]
      .getWalletsByCurrency(this.exchangedCurrency.code)
      .subscribe(
        async (res: any) => {
          this.exchangedWalletList = this.helpers.sortNumbers(res.data, 'balance');
          this.exchangedWallet = res.data[0];

          return true;
        },
        async () => {
          if (this.exchangedCurrency.type === 'crypto' || this.exchangedCurrency.type === 'erc20token') {
            await this.notifications.showNotification('needCreateWallet', 'error');
            this.reset();
            this.router.navigate(['/generate-crypto-wallet']);
          } else {
            this.reset();
            this.getProfile();
          }

          return false;
        });
    this.subs.push(subGetWallet);
    return subGetWallet;
  }

  private async getReceivedWallets() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    if (this.receivedCurrency) {
      const subGetWallet = this.usingService[this.receivedCurrency.type].getWalletsByCurrency(this.receivedCurrency.code).subscribe(
        async (res: any) => {
          this.showMessage = false;
          this.receivedWalletList = this.helpers.sortNumbers(res.data, 'balance');
          this.receivedWallet = res.data[0];
          await loading.dismiss();
        }, async () => {
          await loading.dismiss();

          this.showMessage = true;
          this.missedWalletName = this.receivedCurrency.name;

          if (this.receivedCurrency.type === 'fiat') {
            this.getProfile();
          }

          if (this.receivedCurrency.type === 'erc20token') {
            this.router.navigate(['/generate-crypto-wallet']);
          }
        });
      this.subs.push(subGetWallet);
    }

    await loading.dismiss();
  }

  private getProfile() {
    const subProfile = this.profileService.getProfile().subscribe(
      (res: any) => {
        this.profile = res.data;

        let isFullProfile = false;
        isFullProfile = this.checkProfileAttributes();

        if (isFullProfile) {
          if (!this.exchangedWallet) {
            this.router.navigate(['/waiting-live-kyc']);
          }
        }
      },
      async (thrown) => {
        await this.notifications.showNotification(thrown.error.message, 'error');
      }
    );
    this.subs.push(subProfile);
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

  private async getAvailableWallets() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const requests = [
      this.cryptoWalletsService.getCryptoWallets(),
      this.fiatWalletsService.getFiatWallets()
    ];

    const subAvailableWallets = forkJoin(requests)
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
        async (data: any) => {
          this.availableCurrencies = this.getUnique(data, 'currencyCode');
          await loading.dismiss();
        },
        (thrown) => {
          this.notifications.showNotification(thrown.error.message, 'error', loading);
        });
    this.subs.push(subAvailableWallets);
    return subAvailableWallets;
  }

  private getUnique(array, comp) {
    const unique = array.map(e => e[comp]).map((e, i, final) => final.indexOf(e) === i && i).filter(e => array[e]).map(e => array[e]);
    return unique;
  }

  private openNoAvailableModal(data) {
    return from(this.modalCtrl.create({
      component: NoAvailableExchangeComponent,
      componentProps: { data: data },
      backdropDismiss: false,
      animated: true,
      showBackdrop: true,
      cssClass: 'searchbar-modal'
    })).pipe(
      mergeMap((modal) => {
        return from(modal.present())
      })
    ).subscribe();
  }
}
