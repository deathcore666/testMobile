import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../../services/globals.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { CurrencyService } from '../../../services/currency.service';
import { NotificationsService } from '../../../services/notifications.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CryptoWalletsService } from '../../../services/crypto-wallets.service';
import { CryptoTransactionsService } from '../../../services/crypto-transactions.service';
import { HelpersService } from '../../../services/helpers.service';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-address-transaction',
  templateUrl: './address-transaction.component.html',
  styleUrls: ['./address-transaction.component.scss'],
})
export class AddressTransactionComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = [];

  public sendCoinsForm: FormGroup;
  public data: any;
  public currenciesList: [];
  public walletsList: any;

  constructor(
    private translate: TranslateService,
    private globals: Globals,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private currencyService: CurrencyService,
    private notifications: NotificationsService,
    private formBuilder: FormBuilder,
    private cryptoWalletService: CryptoWalletsService,
    private helpers: HelpersService,
    private cryptoTransactionsService: CryptoTransactionsService
  ) {
    this.translate.setDefaultLang(this.globals.language);

    this.sendCoinsForm = this.formBuilder.group({
      currency: [null, Validators.compose([Validators.required])],
      choosenWallet: [null, Validators.compose([Validators.required])],
      amount: [null, Validators.compose([Validators.required, Validators.min(0), Validators.max(10)])],
      address: [null, Validators.compose([Validators.required])]
    });

    this.sendCoinsForm.get('choosenWallet').disable();
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();
    
    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      this.data = JSON.parse(params.get('data'));
      this.sendCoinsForm.get('address').setValue(this.data.address);
    });
    this.subs.push(subRoute);

    this.getCryptoCurrencies(loading);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  private getCryptoCurrencies(loading) {
    const subGetCryptoCurr = this.currencyService.getCryptoCurrencies().subscribe(
      async (data: any) => {
        this.currenciesList = data.data;
        await loading.dismiss();
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subGetCryptoCurr);
  }

  public async getWalletByCurrency() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const currencyCode = this.sendCoinsForm.get('currency').value;
    const subGetWallet = this.cryptoWalletService.getWalletsByCurrency(currencyCode).subscribe(
      async (data: any) => {
        this.sendCoinsForm.get('choosenWallet').enable();
        this.walletsList = this.helpers.sortNumbers(data.data, 'balance');
        await loading.dismiss();
      },
      async (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subGetWallet);
  }

  public async send() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const formData = this.sendCoinsForm.value;
    const requestBody = {
      fromAddress: formData.choosenWallet.address,
      toAddress: formData.address,
      amount: formData.amount,
      currencyCode: formData.choosenWallet.currencyCode,
      ... (this.data.notes && {notes: this.data.notes})
    };

    const subCreateCrypto = this.cryptoTransactionsService.createCryptoTransactions(requestBody)
      .subscribe((data: any) => {
        this.router.navigate(['/wallets']);
        this.notifications.showNotification(data.message, 'success', loading);
      }, async (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subCreateCrypto);
  }

  public goBack() {
    this.navCtrl.back();
  }
}
