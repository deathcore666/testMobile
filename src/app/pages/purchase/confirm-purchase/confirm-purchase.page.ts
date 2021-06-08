import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';

import { HelpersService } from '../../../services/helpers.service';
import { PurchasesService } from '../../../services/purchases.service';
import { NotificationsService } from '../../../services/notifications.service';
import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-purchase',
  templateUrl: './confirm-purchase.page.html',
  styleUrls: ['./confirm-purchase.page.scss'],
})
export class ConfirmPurchasePage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private token: string;
  public response: any;
  public choosenWallet: any;
  public walletsList: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private purchasesService: PurchasesService,
    private notifications: NotificationsService,
    private helpers: HelpersService,
    private loadingCtrl: LoadingController,
    private globals: Globals,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang(this.globals.language);
  }

  async ngOnInit() {
    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      this.token = params.get('token'); 
    });
    this.subs.push(subRoute);

    this.getOrphanPurchaseDetails();
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async confirm() {
    if (!this.choosenWallet) {
      this.notifications.showNotification('chooseAccount', 'error');
      return;
    }

    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subConfirm = this.purchasesService.confirmOrphanPurchase(this.choosenWallet.address, this.token).subscribe(
      async () => {
        await loading.dismiss();
        this.router.navigate(['/success-purchase'], { replaceUrl: true });
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subConfirm);
  }

  public async cancel() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subCancel = this.purchasesService.cancelOrphanPurchase(this.token).subscribe(
      async () => {
        await loading.dismiss();
        this.router.navigate(['/cancel-purchase'], { replaceUrl: true });
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subCancel);
  }

  public currencyNameStyle(currencyName) {
    if (currencyName) {
      const _currencyName = currencyName.toLowerCase();
      return `wallet-currency-name-${_currencyName}`;
    }
  }

  private getOrphanPurchaseDetails() {
    const subGetDetail = this.purchasesService.getOrphanPurchaseDetails(this.token).subscribe(
      async (data: any) => {
        this.response = data.data;
        this.walletsList = this.helpers.sortNumbers(this.response.wallets, 'balance');

        this.choosenWallet = this.walletsList[0];
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error');
      }
    );
    this.subs.push(subGetDetail);
  }
}
