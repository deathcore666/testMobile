import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';

import { CryptoTransactionsService } from '../../../../services/crypto-transactions.service';
import { NotificationsService } from '../../../../services/notifications.service';

@Component({
  selector: 'app-crypto-maximal-modal',
  templateUrl: './crypto-maximal-modal.component.html',
  styleUrls: ['./crypto-maximal-modal.component.scss'],
})
export class CryptoMaximalModalComponent implements OnInit {
  public data: any;
  public maximalAmount: string;

  constructor(
    private cryptoTransactionsService: CryptoTransactionsService,
    private notifications: NotificationsService,
    private navParams: NavParams,
    public modalCtrl: ModalController,
  ) {
    this.data = this.navParams.data;
  }

  ngOnInit() {
    this.getMaximumCryptoAmount();
  }

  public async getMaximumCryptoAmount() {
    const requestBody = {
      fromAddress: this.data.fromAddress,
      toAddress: this.data.toAddress,
      currencyCode: this.data.currencyCode,
    };

    this.cryptoTransactionsService.createMaxCryptoTransactions(requestBody).subscribe(
      (availableAmount: any) => {
        this.maximalAmount = availableAmount.data;
      },
      (error) => {
        this.notifications.showNotification(error.error.message, 'error',);
      }
    );
  }

}
