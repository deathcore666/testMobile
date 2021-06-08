import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { WithdrawalService } from '../../../../services/withdrawal.service';
import { NotificationsService } from '../../../../services/notifications.service';
import { Globals } from "../../../../services/globals.service";
import { TransactionHeaderService } from '../../transactions-header.service';
import { WithdrawalDetailsPage } from '../withdrawal-details/withdrawal-details.page';

@Component({
  selector: 'app-withdrawal-list',
  templateUrl: './withdrawal-list.component.html',
  styleUrls: ['./withdrawal-list.component.scss'],
})
export class WithdrawalListComponent implements OnInit {
  private subs: Subscription[] = [];
  public withdrawalList = [];
  public title: string;
  public message: string;
  public showNotFound: boolean;

  constructor(
    private withdrawalService: WithdrawalService,
    private notifications: NotificationsService,
    private headerService: TransactionHeaderService,
    private loadingCtrl: LoadingController,
    private translate: TranslateService,
    private globals: Globals,
    private modalCtrl: ModalController
  ) {
    const subTranslate = this.translate.getTranslation(this.globals.language).subscribe((messages: any) => {
      this.title = messages.notFound.withdrawTitle;
      this.message = messages.notFound.withdrawMessage;
    });
    this.subs.push(subTranslate);
  }

  ngOnInit() {
    this.headerService.setHeaderChanges({ title: 'transactions.titleWithdrawal' });
    this.getWithdrawals();
  }

  private async getWithdrawals() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subGetWithdrawal = this.withdrawalService.getWithdrawals().subscribe(
      async (data: any) => {
        if (data.data.length === 0) {
          this.showNotFound = true;
        }
        this.withdrawalList = data.data;
        await loading.dismiss();
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      });
    this.subs.push(subGetWithdrawal);
  }

  public currencyNameStyle(currencyName) {
    if (currencyName) {
      const _currencyName = currencyName.toLowerCase();
      return `wallet-currency-name-${_currencyName}`;
    }
  }

  public async openWithdrawalDetails(withdrawal: any) {
    const modal = await this.modalCtrl.create({
      component: WithdrawalDetailsPage,
      componentProps: { withdrawal },
      backdropDismiss: false,
      animated: true,
      showBackdrop: true,
      cssClass: 'searchbar-modal'
    });

    await modal.present();
  }

  public async refresh(refresher) {
    await this.getWithdrawals();
    await refresher.target.complete();
  }

}
