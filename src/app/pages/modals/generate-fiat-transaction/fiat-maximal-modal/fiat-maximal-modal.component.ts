import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';

import { CryptoTransactionsService } from '../../../../services/crypto-transactions.service';
import { NotificationsService } from '../../../../services/notifications.service';
import { FiatTransactionsService } from '../../../../services/fiat-transactions.service';

@Component({
  selector: 'app-fiat-maximal-modal',
  templateUrl: './fiat-maximal-modal.component.html',
  styleUrls: ['./fiat-maximal-modal.component.scss'],
})
export class FiatMaximalModalComponent implements OnInit {
  public data: any;
  public maximalAmount: string;

  constructor(
    private fiatTransactionsService: FiatTransactionsService,
    private notifications: NotificationsService,
    private navParams: NavParams,
    public modalCtrl: ModalController,
  ) {
    this.data = this.navParams.data;
    console.log(this.data);
  }

  ngOnInit() {
    this.getMaximumCryptoAmount();
  }

  public async getMaximumCryptoAmount() {
    const requestBody = {
      fromAddress: this.data.fromAddress,
      currencyCode: this.data.currencyCode,
      transactionType: this.data.transactionType
    };

    this.fiatTransactionsService.createMaxFiatTransactions(requestBody).subscribe(
      (availableAmount: any) => {
        this.maximalAmount = availableAmount.data;
      },
      (error) => {
        this.notifications.showNotification(error.error.message, 'error',);
      }
    );
  }
}
