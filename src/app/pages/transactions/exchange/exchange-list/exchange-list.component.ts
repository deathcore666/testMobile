import { Component, OnInit } from '@angular/core';

import { ExchangeService } from '../../../../services/exchange.service';
import { NotificationsService } from '../../../../services/notifications.service';
import { ExchangeDetailsPage } from '../exchange-details/exchange-details.page';
import { Globals } from "../../../../services/globals.service";

import { Subscription } from 'rxjs';
import { ModalController, LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { TransactionHeaderService } from '../../transactions-header.service';

@Component({
  selector: 'app-exchange-list',
  templateUrl: './exchange-list.component.html',
  styleUrls: ['./exchange-list.component.scss'],
})
export class ExchangeListComponent implements OnInit {
  private subs: Subscription[] = [];
  public exchangeList = [];
  public title: string;
  public message: string;
  public showNotFound: boolean;

  constructor(
    private exchangeService: ExchangeService,
    private notifications: NotificationsService,
    private headerService: TransactionHeaderService,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private translate: TranslateService,
    private globals: Globals
  ) { 
    const subTranslate = this.translate.getTranslation(this.globals.language).subscribe((messages: any) => {
      this.title = messages.notFound.exchangesTitle;
      this.message = messages.notFound.exchangesMessage;
    });
    this.subs.push(subTranslate);
  }
  
  ngOnInit() {
    this.headerService.setHeaderChanges({ title: 'transactions.titleExchanges' });
    this.getExchanges();
  }

  private async getExchanges() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const skip = this.exchangeList ? this.exchangeList.length : 0;

    const subGetExchange = this.exchangeService.getExchanges(skip).subscribe(
      async (data: any) => {
        skip > 0 ? this.exchangeList.push(...data.data) : this.exchangeList = data.data;
        await loading.dismiss();
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      });
    this.subs.push(subGetExchange);
  }

  public currencyNameStyle(currencyName) {
    if (currencyName) {
      const _currencyName = currencyName.toLowerCase();
      return `wallet-currency-name-${_currencyName}`;
    }
  }

  public async openExchangeDetails(exchange: any) {
    const modal = await this.modalCtrl.create({
      component: ExchangeDetailsPage,
      componentProps: { exchange },
      backdropDismiss: false,
      animated: true,
      showBackdrop: true,
      cssClass: 'searchbar-modal'
    });

    await modal.present();
  }

  public async refresh(refresher) {
    await this.getExchanges();
    await refresher.target.complete();
  }

  public loadMoreTransactions(event) {
    this.getExchanges();
    event.target.complete();
  }
}
