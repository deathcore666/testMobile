import { Component, OnInit, OnDestroy } from '@angular/core';

import { RequestsService } from "../../../../services/requests.service";
import { NotificationsService } from "../../../../services/notifications.service";
import { FiatWalletsService } from "../../../../services/fiat-wallets.service";
import { Globals } from "../../../../services/globals.service";
import { TranslateService } from "@ngx-translate/core";

import { Subscription } from 'rxjs';
import { LoadingController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { IncomeRequestDetailsPage } from '../income-request-details/income-request-details.page';

@Component({
  selector: 'app-income-request-list',
  templateUrl: './income-request-list.component.html',
  styleUrls: ['./income-request-list.component.scss'],
})
export class IncomeRequestListComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public incomeRequestList: any[];
  public title: string;
  public message: string;
  public showNotFound: boolean;

  constructor(
    private requestsService: RequestsService,
    private notifications: NotificationsService,
    private fiatWalletsService: FiatWalletsService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private globals: Globals,
    private translate: TranslateService,
    private modalController: ModalController
  ) {
    const subTranslate = this.translate.getTranslation(this.globals.language).subscribe((messages: any) => {
      this.title = messages.notFound.incomingRequestsTitle;
      this.message = messages.notFound.incomingRequestsMessage;
    });
    this.subs.push(subTranslate);
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ spinner: "crescent" });
    await loading.present();

    this.getIncomeRequest(loading);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public getIncomeRequest(loading) {
    const subGetCoins = this.requestsService.getCoinRequests().subscribe(
      (data: any) => {
        if (data.incoming.length === 0) {
          this.showNotFound = true;
        }
        this.incomeRequestList = data.incoming;
        loading.dismiss();
      },
      (thrown: any) => {
        this.notifications.showNotification(thrown.error.message, "error", loading);
      }
    );
    this.subs.push(subGetCoins);
  }

  public currencyNameStyle(currencyName) {
    if (currencyName) {
      const _currencyName = currencyName.toLowerCase();
      return `wallet-currency-name-${_currencyName}`;
    }
  }

  public async refresh(refresher) {
    const loading = await this.loadingCtrl.create({ spinner: "crescent" });
    await loading.present();

    await this.getIncomeRequest(loading);
    refresher.target.complete();
  }

  public async sendFunds(request: any) {
    const incomingRequest = {
      currencyCode: request.currencyCode,
      toAddress: request.toAddress,
      amount: request.amount,
      recipientAccounts: null,
      recipientName: null
    };

    if (request.currencyType === "fiat") {
      const loading = await this.loadingCtrl.create({ spinner: "crescent" });
      await loading.present();
  
      const subFindAccount = this.fiatWalletsService
        .findEcosystemAccounts(
          incomingRequest.toAddress,
          incomingRequest.currencyCode
        )
        .subscribe(
          async (res: any) => {
            request.recipientAccounts = res.data.accounts;
            await loading.dismiss();
            this.router.navigate(["/ecosystem-transaction", { data: JSON.stringify(request) }]);
          },
          async (thrown: any) => {
            await this.notifications.showNotification(thrown.error.message, "error", loading);
          }
        );
      this.subs.push(subFindAccount);
    } else {
      return this.router.navigate(["/smart-crypto-transaction", { data: JSON.stringify(incomingRequest) }]);
    }
  }

  public async openOutcomeDetailsModal(id: any) {
    const modal = await this.modalController.create({
      component: IncomeRequestDetailsPage,
      componentProps: { id },
      backdropDismiss: false,
      animated: true,
      showBackdrop: true,
      cssClass: 'searchbar-modal'
    });

    await modal.present();
  }

}
