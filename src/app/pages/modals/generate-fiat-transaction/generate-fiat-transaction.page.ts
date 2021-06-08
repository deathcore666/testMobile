import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingController, NavController} from '@ionic/angular';
import { environment } from '../../../../environments/environment';

import { FiatWalletsService } from '../../../services/fiat-wallets.service';
import { NotificationsService } from '../../../services/notifications.service';
import { CurrencyService } from '../../../services/currency.service';
import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FiatTransactionsService } from '../../../services/fiat-transactions.service';

@Component({
  selector: 'app-generate-fiat-transaction',
  templateUrl: './generate-fiat-transaction.page.html',
  styleUrls: ['./generate-fiat-transaction.page.scss'],
})
export class GenerateFiatTransactionPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public data: any;
  public identifier: string;
  public currencyDetails: any;

  public sepaFullName: string;
  public sepaAmount: number;

  public swiftFullName: string;
  public swiftAmount: number;

  public achFullName: string;
  public achAmount: number;

  public chapsAmount: number;

  public slideOpts = {
    effect: 'flip',
    loop: false,
    zoom: false,
    spaceBetween: 100,
    disableSlider: true
  };
  public ecosystemIcon: string;

  constructor(
    public navCtrl: NavController,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fiatWalletsService: FiatWalletsService,
    private fiatTransactionsService: FiatTransactionsService,
    private currencyService: CurrencyService,
    private notifications: NotificationsService,
    private loadingCtrl: LoadingController,
    private globals: Globals,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang(this.globals.language);
    this.ecosystemIcon = environment.WHITE_LABEL_ICON;
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subRoute = this.activatedRoute.paramMap.subscribe(async (params: any) => {
      this.data = JSON.parse(params.params.data);
      console.log(this.data);
    });
    this.subs.push(subRoute);

    this.getPaymentsMethods(loading);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async next(fiatTransaction) {
    const transactionType = fiatTransaction.toLowerCase();
    
    switch (transactionType) {
      case 'sepa':
        this.data.amount = this.sepaAmount;
      
        this.router.navigate(['/sepa-transaction', { data: JSON.stringify(this.data) }]);
        break;
      case 'swift':
        this.data.amount = this.swiftAmount;

        this.router.navigate(['/swift-transaction', { data: JSON.stringify(this.data) }]);
        break;
      case 'ach':
        this.data.amount = this.achAmount;
        this.data.accountName = this.achFullName;

        this.router.navigate(['/ach-transaction', { data: JSON.stringify(this.data) }]);
        break;
      case 'chaps':
        this.data.amount = this.chapsAmount;

        this.router.navigate(['/chaps-transaction', { data: JSON.stringify(this.data) }]);
        break;
      default:
        const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
        await loading.present();
        
        if (this.identifier.includes('@')) {
          this.identifier = this.identifier.toLowerCase();
        }

        const subFindEcosystem = this.fiatWalletsService.findEcosystemAccounts(this.identifier, this.data.currencyCode).subscribe(
          async (res: any) => {
            this.data.recipientAccounts = res.data.accounts;

            await loading.dismiss();
            this.router.navigate(['/ecosystem-transaction', { data: JSON.stringify(this.data) }]);
          }, (thrown) => {
          this.notifications.showNotification(thrown.error.message, 'error', loading);
        });
        this.subs.push(subFindEcosystem);
        break;
    }
  }

  public async getMaximumFiatAmount(type: string, isChaps?: boolean) {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const requestBody = {
      fromAddress: this.data.address,
      currencyCode: this.data.currencyCode,
      transactionType: type
    };

    this.fiatTransactionsService.createMaxFiatTransactions(requestBody).subscribe(
      async (data: any) => {
        if (type === 'sepa') {
          this.sepaAmount = data.data;
        } else {
          if (isChaps) {
            this.chapsAmount = data.data;
          } else {
            this.swiftAmount = data.data;
          }
        }
        await loading.dismiss();
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
  }

  public disableSlider() {
    const element = document.getElementsByTagName('ion-slides');
    element[0].style.height = 'auto';
  }

  public enableSlider() {
    const element = document.getElementsByTagName('ion-slides');
    element[0].style.height = '95%';
  }

  private getPaymentsMethods(loading) {
    const subGetCurrencyMethod = this.currencyService.getCurrencyPaymentMethods(this.data.currencyCode).subscribe(
      async (data: any) => {
        this.currencyDetails = data.data;
        await loading.dismiss();
      }, (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subGetCurrencyMethod);
  }

  public goBack() {
    this.navCtrl.back();
  }
}
