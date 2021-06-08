import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { Globals } from "../../../../services/globals.service";
import { PurchasesService } from '../../../../services/purchases.service';
import { NotificationsService } from '../../../../services/notifications.service';
import { ModalController, LoadingController } from '@ionic/angular';
import { PurchaseDetailsPage } from '../purchase-details/purchase-details.page';
import { TransactionHeaderService } from '../../transactions-header.service';


@Component({
  selector: 'app-purchase-list',
  templateUrl: './purchase-list.component.html',
  styleUrls: ['./purchase-list.component.scss'],
})
export class PurchaseListComponent implements OnInit {
  private subs: Subscription[] = [];
  public purchaseList = [];
  public title: string;
  public message: string;
  public showNotFound: boolean;

  constructor(
    private notifications: NotificationsService,
    private purchasesService: PurchasesService,
    private headerService: TransactionHeaderService,
    private translate: TranslateService,
    private globals: Globals,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController
  ) { 
    const subTranslate = this.translate.getTranslation(this.globals.language).subscribe((messages: any) => {
      this.title = messages.notFound.purchasesTitle;
      this.message = messages.notFound.purchasesMessage;
    });
    this.subs.push(subTranslate);
  }
  
  ngOnInit() {
    this.headerService.setHeaderChanges({ title: 'transactions.titlePurchases' });
    this.getPurchases();
  }

  private async getPurchases() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const skip = this.purchaseList ? this.purchaseList.length : 0;

    const subGetPurchases  = this.purchasesService.getPurchases(skip).subscribe(
      async (data: any) => {
        skip > 0 ? this.purchaseList.push(...data.data) : this.purchaseList = data.data;
        await loading.dismiss();
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      });
    this.subs.push(subGetPurchases);
  }

  public currencyNameStyle(currencyName) {
    if (currencyName) {
      const _currencyName = currencyName.toLowerCase();
      return `wallet-currency-name-${_currencyName}`;
    }
  }

  public async openPurchaseDetails(purchase: any) {
    const modal = await this.modalCtrl.create({
      component: PurchaseDetailsPage,
      componentProps: { purchase },
      backdropDismiss: false,
      animated: true,
      showBackdrop: true,
      cssClass: 'searchbar-modal'
    });

    await modal.present();
  }

  public async refresh(refresher) {
    await this.getPurchases();
    await refresher.target.complete();
  }

  public loadMoreTransactions(event) {
    this.getPurchases();
    event.target.complete();
  }

}
