import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { HelpersService } from '../../../services/helpers.service';
import { WithdrawalService } from '../../../services/withdrawal.service';
import { NotificationsService } from '../../../services/notifications.service';
import { Globals } from '../../../services/globals.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-withdrawal',
  templateUrl: './confirm-withdrawal.page.html',
  styleUrls: ['./confirm-withdrawal.page.scss'],
})
export class ConfirmWithdrawalPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private token: string;
  public response: any;
  public choosenAccount: any;
  public accountsList = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private withdrawalService: WithdrawalService,
    private notifications: NotificationsService,
    private helpers: HelpersService,
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

    // Assign this withdrawal by verify token
    const subGetWithdrawal = this.withdrawalService.getPendingWithdrawalDetails(this.token).subscribe(
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
    this.subs.push(subGetWithdrawal);
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

    const subConfirm = this.withdrawalService.confirmWithdrawal(this.choosenAccount.address, this.token).subscribe(
      async () => {
        await loading.dismiss();
        this.router.navigate(['/success-withdrawal'], { replaceUrl: true });
      },
      async (thrown) => {
        await this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subConfirm);
  }

  public async cancel() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subCancel = this.withdrawalService.cancelWithdrawal(this.token).subscribe(
      async () => {
        await loading.dismiss();
        this.router.navigate(['/cancel-withdrawal'], { replaceUrl: true });
      },
      async (thrown) => {
        await this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subCancel);
  }

}
