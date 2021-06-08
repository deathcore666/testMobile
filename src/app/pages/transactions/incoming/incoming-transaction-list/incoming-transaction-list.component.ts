import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { CryptoTransactionsService } from '../../../../services/crypto-transactions.service';
import { FiatTransactionsService } from '../../../../services/fiat-transactions.service';
import { HelpersService } from '../../../../services/helpers.service';
import { Globals } from "../../../../services/globals.service";
import { IncomingTransactionDetailsPage } from '../incoming-transaction-details/incoming-transaction-details.page';
import { NotificationsService } from '../../../../services/notifications.service';

import { forkJoin, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { TransactionHeaderService } from '../../transactions-header.service';

@Component({
  selector: 'app-incoming-transaction-list',
  templateUrl: './incoming-transaction-list.component.html',
  styleUrls: ['./incoming-transaction-list.component.scss'],
})
export class IncomingTransactionListComponent implements OnInit {
  private subs: Subscription[] = [];
  public incomeTransactionsList = [];
  public title: string;
  public message: string;
  public showNotFound: boolean;

  constructor(
    private cryptoTransactionsService: CryptoTransactionsService,
    private fiatTransactionsService: FiatTransactionsService,
    private headerService: TransactionHeaderService,
    private notifications: NotificationsService,
    private helpersService: HelpersService,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private translate: TranslateService,
    private globals: Globals
  ) { 
    const subTranslate = this.translate.getTranslation(this.globals.language).subscribe((messages: any) => {
      this.title = messages.notFound.incomingTransactionsTitle;
      this.message = messages.notFound.incomingTransactionsMessage;
    });
    this.subs.push(subTranslate);
  }
  
  ngOnInit() {
    this.headerService.setHeaderChanges({ title: 'transactions.titleIncoming' });
    this.getIncomingTransactions();
  }

  private async getIncomingTransactions() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const requests = [
      this.cryptoTransactionsService.getIncomingCryptoTransactions(),
      this.fiatTransactionsService.getIncomingFiatTransactions()
    ];

    const subGetInTransactions = forkJoin(requests)
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
        async(data: any) => {
          if (data.length === 0) {
            this.showNotFound = true;
          }
          this.incomeTransactionsList = this.helpersService.sortByDate(data, 'createdAt');
          await loading.dismiss();
        },
        (thrown: any) => {
          this.notifications.showNotification(thrown.error.message, 'error', loading);
        }
      );
    this.subs.push(subGetInTransactions);
    return subGetInTransactions;
  }

  public currencyNameStyle(currencyName) {
    if (currencyName) {
      const _currencyName = currencyName.toLowerCase();
      return `wallet-currency-name-${_currencyName}`;
    }
  }

  public async openIncomingTransactionDetails(id: any, currencyType: any) {
    const modal = await this.modalCtrl.create({
      component: IncomingTransactionDetailsPage,
      componentProps: { id, currencyType },
      backdropDismiss: false,
      animated: true,
      showBackdrop: true,
      cssClass: 'searchbar-modal'
    });

    await modal.present();
  }

  public async refresh(refresher) {
    await this.getIncomingTransactions();
    await refresher.target.complete();
  }

}
