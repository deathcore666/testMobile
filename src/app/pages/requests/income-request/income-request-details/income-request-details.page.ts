import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Clipboard } from '@ionic-native/clipboard/ngx';

import { RequestsService } from '../../../../services/requests.service';
import { FiatWalletsService } from '../../../../services/fiat-wallets.service';
import { NotificationsService } from '../../../../services/notifications.service';
import { Globals } from '../../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-income-request-details',
  templateUrl: './income-request-details.page.html',
  styleUrls: ['./income-request-details.page.scss'],
})
export class IncomeRequestDetailsPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private id: string;
  public incomeRequest: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private requestsService: RequestsService,
    private fiatWalletsService: FiatWalletsService,
    private notifications: NotificationsService,
    private loadingCtrl: LoadingController,
    private clipboard: Clipboard,
    private globals: Globals,
    private translate: TranslateService,
    private modalCtrl: ModalController
  ) {
    this.translate.setDefaultLang(this.globals.language);

    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      this.id = params.get('incomeRequestId'); 
    });
    this.subs.push(subRoute);
  }

  ngOnInit() {
    this.getCoinRequestDetails();
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async sendFunds() {
    const body = {
      currencyCode: this.incomeRequest.currencyCode,
      toAddress: this.incomeRequest.address,
      amount: this.incomeRequest.amount,
      recipientAccounts: null,
      recipientName: null
    };

    if (this.incomeRequest.currencyType === 'fiat') {
      const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
      await loading.present();
  
      const subFindAccount = this.fiatWalletsService.findEcosystemAccounts(body.toAddress, this.incomeRequest.currencyCode).subscribe(
        async (res: any) => {
          body.recipientAccounts = res.data.accounts;
          body.recipientName = res.data.receiver;
          await loading.dismiss();
          this.modalCtrl.dismiss();
          this.router.navigate(['/ecosystem-transaction', { data: JSON.stringify(body) }]);
        },
        async (thrown) => {
          await this.notifications.showNotification(thrown.error.message, 'error', loading);
        }
      );
      this.subs.push(subFindAccount);
    } else {
      return this.router.navigate(['/smart-crypto-transaction', { data: JSON.stringify(body) }]);
    }
  }

  public successCopy(text: string) {
    this.clipboard.copy(text);
    this.notifications.showNotification('addressCopied', 'success');
  }

  private getCoinRequestDetails() {
    const subGetCoins = this.requestsService.getCoinRequestDetails(this.id).subscribe((result: any) => {
      this.incomeRequest = result.data;
    }, (thrown) => {
      this.notifications.showNotification(thrown.error.message, 'error');
    });
    this.subs.push(subGetCoins);
  }

  public async closeModal() {
    await this.modalCtrl.dismiss();
  }
}
