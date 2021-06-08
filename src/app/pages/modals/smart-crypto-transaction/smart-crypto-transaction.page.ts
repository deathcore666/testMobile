import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingController, NavController, ModalController } from '@ionic/angular';

import { CryptoWalletsService } from '../../../services/crypto-wallets.service';
import { CryptoTransactionsService } from '../../../services/crypto-transactions.service';
import { CurrencyService } from '../../../services/currency.service';
import { NotificationsService } from '../../../services/notifications.service';
import { HelpersService } from '../../../services/helpers.service';
import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-smart-crypto-transaction',
  templateUrl: './smart-crypto-transaction.page.html',
  styleUrls: ['./smart-crypto-transaction.page.scss'],
})
export class SmartCryptoTransactionPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private currenciesList: any;

  public data: any;
  public walletsList: any;
  public disableCurrenciesSelect = true;
  public missedCurrency: boolean;
  public choosenWallet: any;
  public errorMessage: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cryptoWalletService: CryptoWalletsService,
    private cryptoTransactionsService: CryptoTransactionsService,
    private currencyService: CurrencyService,
    private notifications: NotificationsService,
    private helpers: HelpersService,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private globals: Globals,
    private translate: TranslateService,
    private modalCtrl: ModalController,
  ) {
    this.translate.setDefaultLang(this.globals.language);
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();
    const modalTop = await this.modalCtrl.getTop();
    if (modalTop) {
      this.modalCtrl.dismiss();
    }
    
    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      this.data = JSON.parse(params.get('data')); 
      this.data.currency = this.data.currency ? this.data.currency : this.data.currencyCode;
      this.data.address = this.data.toAddress ? this.data.toAddress : this.data.address;
    });
    this.subs.push(subRoute);

    this.getCryptoCurrencies(loading);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async send() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const requestBody = {
      fromAddress: this.choosenWallet.address,
      toAddress: this.data.address,
      amount: this.data.amount.toString(),
      currencyCode: this.choosenWallet.currencyCode,
      ... (this.data.notes && {notes: this.data.notes})
    };

    const subCreateCrypto = this.cryptoTransactionsService.createCryptoTransactions(requestBody)
      .subscribe((data: any) => {
        this.notifications.showNotification(data.message, 'success', loading);
        this.router.navigate(['/wallets']);
      }, async (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subCreateCrypto);
  }

  private getWalletByCurrency(loading) {
    const subGetWallet = this.cryptoWalletService.getWalletsByCurrency(this.data.currency).subscribe(
      async (data: any) => {
        this.walletsList = this.helpers.sortNumbers(data.data, 'balance');
        this.currenciesList = [{ name: this.data.currency }];

        this.choosenWallet = this.walletsList[0];
        await loading.dismiss();
      },
      async (thrown) => {
        this.missedCurrency = true;
        this.errorMessage = thrown.error.message;
        await loading.dismiss();
      }
    );
    this.subs.push(subGetWallet);
  }

  private getCryptoCurrencies(loading) {
    const subGetCrypto = this.currencyService.getCryptoCurrencies().subscribe(
      async (data: any) => {
        this.currenciesList = data.data;
        await loading.dismiss();

        if (this.data.currency) {
          this.getWalletByCurrency(loading);
        } else {
          this.disableCurrenciesSelect = false;
        }
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subGetCrypto);
  }

  public openScanner() {
    this.router.navigate(['/qr-scanner']);
  }

  public goBack() {
    this.navCtrl.back();
  }
}
