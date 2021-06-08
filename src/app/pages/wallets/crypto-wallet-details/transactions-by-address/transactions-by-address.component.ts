import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

import { Globals } from '../../../../services/globals.service';
import { CryptoTransactionsService } from '../../../../services/crypto-transactions.service';
import { ExchangeService } from '../../../../services/exchange.service';
import { PurchasesService } from '../../../../services/purchases.service';

@Component({
  selector: 'app-transactions-by-address',
  templateUrl: './transactions-by-address.component.html',
  styleUrls: ['./transactions-by-address.component.scss'],
})
export class TransactionsByAddressComponent {
  public transactionType: string;
  public filteredTransactions = [];
  public transactions;
  public title;
  public message;

  constructor(
    private cryptoTransactionsService: CryptoTransactionsService,
    private exchangeService: ExchangeService,
    private purchasesService: PurchasesService,
    private modalCtrl: ModalController,
    public navParams: NavParams,
    private translate: TranslateService,
    private globals: Globals,
  ) {
    this.translate.getTranslation(this.globals.language).subscribe((messages: any) => {
      this.title = messages.notFound;
      this.message = messages.notFound;
    });

    this.getTransactions();
  }

  private getTransactions() {
    const walletAddress = this.navParams.get('walletAddress');
    
    forkJoin([
      this.cryptoTransactionsService.getOutgoingTransactionsByAddress(walletAddress),
      this.cryptoTransactionsService.getIncomingTransactionsByAddress(walletAddress),
      this.exchangeService.getExchangeByAddress(walletAddress),
      this.purchasesService.getPurchasesByAddress(walletAddress)
    ]).subscribe((res: any[]) => {
      const outgoingTransaction = res[0].data.map((item) => Object.assign(item, { type: 'outgoing' }));
      const incomingTransaction = res[1].data.map((item) => Object.assign(item, { type: 'incoming' }));
      const exchangeTransaction = res[2].data.map((item) => Object.assign(item, { type: 'exchange' }));
      const purchaseTransaction = res[3].data.map((item) => Object.assign(item, { type: 'purchase' }));
      const allTransaction = outgoingTransaction.concat(incomingTransaction)
                                                .concat(exchangeTransaction)
                                                .concat(purchaseTransaction);

      this.transactions = allTransaction;
      this.filterAllTransactions('outgoing');
    });
  }

  public filterAllTransactions(type: string) {
    this.transactionType = type;
    this.filteredTransactions = this.transactions.filter((item) => { return item.type === type });
  }
  
  public async closeModal() {
    await this.modalCtrl.dismiss();
  }

  public currencyNameStyle(currencyName) {
    if (currencyName) {
      const _currencyName = currencyName.toLowerCase();
      return `wallet-currency-name-${_currencyName}`;
    }
  }
}
