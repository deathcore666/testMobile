import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoadingController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { DepositService } from '../../../../services/deposit.service';
import { NotificationsService } from '../../../../services/notifications.service';
import { Globals } from "../../../../services/globals.service";
import { TransactionHeaderService } from '../../transactions-header.service';
import { DepositDetailsPage } from '../deposit-details/deposit-details.page';

@Component({
  selector: 'app-deposit-list',
  templateUrl: './deposit-list.component.html',
  styleUrls: ['./deposit-list.component.scss'],
})
export class DepositListComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public depositList = [];
  public title: string;
  public message: string;
  public showNotFound: boolean;

  constructor(
    private depositService: DepositService,
    private notifications: NotificationsService,
    private headerService: TransactionHeaderService,
    private loadingCtrl: LoadingController,
    private translate: TranslateService,
    private globals: Globals,
    private modalCtrl: ModalController
  ) {
    const subTranslate = this.translate.getTranslation(this.globals.language).subscribe((messages: any) => {
      this.title = messages.notFound.depositTitle;
      this.message = messages.notFound.depositMessage;
    });
    this.subs.push(subTranslate);
  }
  
  ngOnInit() {
    this.headerService.setHeaderChanges({title: 'transactions.titleDeposit'});
    this.getDeposits();
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  private async getDeposits() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subGetDeposit = this.depositService.getDeposits().subscribe(
      async (data: any) => {
        if (data.data.length === 0) {
          this.showNotFound = true;
        }
        this.depositList = data.data;
        await loading.dismiss();
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      });
    this.subs.push(subGetDeposit);
  }

  public currencyNameStyle(currencyName) {
    if (currencyName) {
      const _currencyName = currencyName.toLowerCase();
      return `wallet-currency-name-${_currencyName}`;
    }
  }

  public async openDepositDetails(deposit: any) {
    const modal = await this.modalCtrl.create({
      component: DepositDetailsPage,
      componentProps: { deposit },
      backdropDismiss: false,
      animated: true,
      showBackdrop: true,
      cssClass: 'searchbar-modal'
    });

    await modal.present();
  }

  public async refresh(refresher) {
    await this.getDeposits();
    await refresher.target.complete();
  }

}
