import { Component, OnInit, OnDestroy } from '@angular/core';

import { RequestsService } from "../../../../services/requests.service";
import { NotificationsService } from "../../../../services/notifications.service";
import { Globals } from "../../../../services/globals.service";
import { TranslateService } from "@ngx-translate/core";

import { Subscription } from 'rxjs';
import { LoadingController, ModalController, BooleanValueAccessor } from '@ionic/angular';
import { OutcomeRequestDetailsPage } from '../outcome-request-details/outcome-request-details.page';

@Component({
  selector: 'app-outcome-request-list',
  templateUrl: './outcome-request-list.component.html',
  styleUrls: ['./outcome-request-list.component.scss'],
})
export class OutcomeRequestListComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public outcomeRequestList: any[];
  public title: string;
  public message: string;
  public showNotFound: boolean;

  constructor(
    private requestsService: RequestsService,
    private notifications: NotificationsService,
    private loadingCtrl: LoadingController,
    private globals: Globals,
    private translate: TranslateService,
    private modalController: ModalController
  ) {
    const subTranslate = this.translate.getTranslation(this.globals.language).subscribe((messages: any) => {
      this.title = messages.notFound.outgoingRequestsTitle;
      this.message = messages.notFound.outgoingRequestsMessage;
    });
    this.subs.push(subTranslate);
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ spinner: "crescent" });
    await loading.present();

    this.getOutcomeRequest(loading);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public getOutcomeRequest(loading) {
    const subGetCoins = this.requestsService.getCoinRequests().subscribe(
      (data: any) => {
        if (data.outgoing.length === 0) {
          this.showNotFound = true;
        }
        this.outcomeRequestList = data.outgoing;
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

    await this.getOutcomeRequest(loading);
    refresher.target.complete();
  }

  public async openOutcomeDetailsModal(id: any) {
    const modal = await this.modalController.create({
      component: OutcomeRequestDetailsPage,
      componentProps: { id },
      backdropDismiss: false,
      animated: true,
      showBackdrop: true,
      cssClass: 'searchbar-modal'
    });

    await modal.present();
  }

}
