import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';

import { CryptoTransactionsService } from '../../../../services/crypto-transactions.service';
import { FiatTransactionsService } from '../../../../services/fiat-transactions.service';
import { HelpersService } from '../../../../services/helpers.service';
import { Globals } from "../../../../services/globals.service";
import { TransactionHeaderService } from '../../transactions-header.service';
import { NotificationsService } from '../../../../services/notifications.service';

import { forkJoin, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { OutgoingTransactionDetailsPage } from '../outgoing-transaction-details/outgoing-transaction-details.page';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-outgoing-transaction-list',
  templateUrl: './outgoing-transaction-list.component.html',
  styleUrls: ['./outgoing-transaction-list.component.scss'],
})
export class OutgoingTransactionListComponent implements OnInit {
  private subs: Subscription[] = [];
  public outcomeTransactionsList = [];
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
    private globals: Globals,
    private translate: TranslateService
  ) { 
    const subTranslate = this.translate.getTranslation(this.globals.language).subscribe((messages: any) => {
      this.title = messages.notFound.outgoingTransactionsTitle;
      this.message = messages.notFound.outgoingTransactionsMessage;
    });
    this.subs.push(subTranslate);
  }
  
  ngOnInit() {
    this.headerService.setHeaderChanges({ title: 'transactions.titleOutgoing' });
    this.getOutgoingTransactions();
  }

  private async getOutgoingTransactions() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const requests = [
      this.cryptoTransactionsService.getOutgoingCryptoTransactions(),
      this.fiatTransactionsService.getOutgoingFiatTransactions()
    ];

    const subGetOutTransactions = forkJoin(requests)
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
          if (data.length === 0) {
            this.showNotFound = true;
          }
          this.outcomeTransactionsList = this.helpersService.sortByDate(data, 'createdAt');
          await loading.dismiss();
        },
        (thrown: any) => {
          this.notifications.showNotification(thrown.error.message, 'error', loading);
        }
      );
    this.subs.push(subGetOutTransactions);
    return subGetOutTransactions;
  }

  public currencyNameStyle(currencyName) {
    if (currencyName) {
      const _currencyName = currencyName.toLowerCase();
      return `wallet-currency-name-${_currencyName}`;
    }
  }

  public async openOutgoingTransactionDetails(id: any, currencyType: any) {
    const modal = await this.modalCtrl.create({
      component: OutgoingTransactionDetailsPage,
      componentProps: { id, currencyType },
      backdropDismiss: false,
      animated: true,
      showBackdrop: true,
      cssClass: 'searchbar-modal'
    });

    await modal.present();
  }

  public async refresh(refresher) {
    await this.getOutgoingTransactions();
    await refresher.target.complete();
  }

}
