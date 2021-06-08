import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { DepositService } from '../../../services/deposit.service';
import { NotificationsService } from '../../../services/notifications.service';
import { Globals } from '../../../services/globals.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-deposit',
  templateUrl: './confirm-deposit.page.html',
  styleUrls: ['./confirm-deposit.page.scss'],
})
export class ConfirmDepositPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private token: string;
  public response: any;
  public choosenAccount: any;
  public accountsList = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private depositService: DepositService,
    private notifications: NotificationsService,
    private loadingCtrl: LoadingController,
    private translate: TranslateService,
    private globals: Globals
  ) {
    this.translate.setDefaultLang(this.globals.language);

    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      this.token = params.get('token');
    });
    this.subs.push(subRoute);
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    // Assign this deposit by verify token
    const subDeposit = this.depositService.getPendingDepositDetails(this.token).subscribe(
      async (data: any) => {
        this.response = data.data;
        this.accountsList.push(this.response.account);

        this.accountsList.forEach((account) => {
          account.shortAddress = `****${account.address.substring(account.address.length, account.address.length - 4)}`;
        });

        this.choosenAccount = this.accountsList[0];

        await loading.dismiss();
      },
      async (thrown) => {
        this.router.navigate(['/wallets']);
        await this.notifications.showNotification(thrown.error.message, 'error', loading);
      });
    this.subs.push(subDeposit);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async confirm() {
    if (!this.choosenAccount) {
      const message = 'chooseAccount';
      await this.notifications.showNotification(message, 'error');
      return;
    }

    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subConfirmDeposit = this.depositService.confirmDeposit(this.choosenAccount.address, this.token).subscribe(
      async () => {
        await loading.dismiss();
        this.router.navigate(['/success-deposit'], { replaceUrl: true });
      },
      async (thrown) => {
        await this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subConfirmDeposit);
  }

  public async cancel() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subCancelDeposit = this.depositService.cancelDeposit(this.token).subscribe(
      async () => {
        await loading.dismiss();
        this.router.navigate(['/cancel-deposit'], { replaceUrl: true });
      },
      async (thrown) => {
        await this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subCancelDeposit);
  }

}
