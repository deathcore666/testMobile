import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingController, NavController, ModalController } from '@ionic/angular';

import { FiatTransactionsService } from '../../../../services/fiat-transactions.service';
import { FiatWalletsService } from '../../../../services/fiat-wallets.service';
import { NotificationsService } from '../../../../services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../../../services/globals.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ecosystem-transaction',
  templateUrl: './ecosystem-transaction.page.html',
  styleUrls: ['./ecosystem-transaction.page.scss'],
})
export class EcosystemTransactionPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public isFromRequest: boolean;
  public data: any;
  public choosenWallet: any;
  public notes: string;
  public userWallets: any;
  public errorMessage: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fiatTransactionsService: FiatTransactionsService,
    private fiatWalletsService: FiatWalletsService,
    private notifications: NotificationsService,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private translate: TranslateService,
    private globals: Globals,
    private modalCtrl: ModalController,
  ) {
    this.translate.setDefaultLang(this.globals.language);
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subRoute = this.activatedRoute.paramMap.subscribe((params: any) => {
      this.data = JSON.parse(params.params.data);
    });
    this.subs.push(subRoute);

    /**
     * Replace account address with ****
     */
    this.data.recipientAccounts.forEach((account) => {
      account.walletAddress = `****${account.address.substring(account.address.length, account.address.length - 4)}`;
    });

    this.choosenWallet = this.data.recipientAccounts[0];

    if (this.data.toAddress) {
      this.isFromRequest = true;

      const subGetWallet = this.fiatWalletsService.getWalletsByCurrency(this.data.currencyCode).subscribe(
        async (res: any) => {
          await loading.dismiss();
          this.userWallets = res.data.filter((account) => {
            return account.walletAddress = `****${account.address.substring(account.address.length, account.address.length - 4)}`;
          });

          this.data.address = this.userWallets[0].address;
        },
        async (thrown) => {
          await loading.dismiss();
          this.router.navigate(['/cancel-page', { title: JSON.stringify(thrown.error.message) }]);
        }
      );
      this.subs.push(subGetWallet);
    } else {
      await loading.dismiss();
    }
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public openSelect(whoOpened) {
    setTimeout(() => {
      const optionsButton = document.getElementsByClassName('alert-radio-icon');
      const radioLabel = document.getElementsByClassName('alert-radio-label');

      for (let i = 0; i < this.data.recipientAccounts.length; i++) {
        this.data.recipientAccounts[i].ecosystem = this.data.recipientAccounts[i].ecosystem;
        if (whoOpened === 'receiver') {
          optionsButton.item(i).classList.add(this.data.recipientAccounts[i].ecosystem);
        } else {
          radioLabel.item(i).classList.add('custom-no-padding');
        }
      }
    }, 200);
  }

  public async createTransaction() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const requestBody = {
      fromWallet: this.data.address,
      toWallet: this.choosenWallet.address,
      currencyCode: this.data.currencyCode,
      amount: Number(this.data.amount),
      ... (this.notes && {notes: this.notes})
    };

    const subCreateEcocsystem = this.fiatTransactionsService.createEcosystemTransaction(requestBody).subscribe(
      (data: any) => {
        this.router.navigate(['/wallets']);
        this.notifications.showNotification(data.message, 'success', loading);
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subCreateEcocsystem);
  }

  public async getMaximumCryptoAmount() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const requestBody = {
      fromAddress: this.data.address,
      currencyCode: this.data.currencyCode,
      transactionType: 'ecosystem'
    };

    this.fiatTransactionsService.createMaxFiatTransactions(requestBody).subscribe(
      async (availableAmount: any) => {
        this.data.amount = Number(availableAmount.data);
        await loading.dismiss();
      },
      (error) => {
        this.notifications.showNotification(error.error.message, 'error', loading);
      }
    );
  }

  public goBack() {
    this.navCtrl.back();
  }
}
