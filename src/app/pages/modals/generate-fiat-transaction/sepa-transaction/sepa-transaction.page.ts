import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingController, NavController, ModalController } from '@ionic/angular';

import { FiatTransactionsService } from '../../../../services/fiat-transactions.service';
import { NotificationsService } from '../../../../services/notifications.service';
import { Globals } from '../../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, from } from 'rxjs';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { map, mergeMap } from 'rxjs/operators';
import { FiatMaximalModalComponent } from '../fiat-maximal-modal/fiat-maximal-modal.component';

@Component({
  selector: 'app-sepa-transaction',
  templateUrl: './sepa-transaction.page.html',
  styleUrls: ['./sepa-transaction.page.scss'],
})

export class SepaTransactionPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public fromAddress: string;
  public currencyCode: string;
  public amount: number;

  public sepaTransactionForm: FormGroup;
  public requisitesList: any;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fiatTransactionsService: FiatTransactionsService,
    private notifications: NotificationsService,
    private loadingCtrl: LoadingController,
    private globals: Globals,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
  ) {
    this.translate.setDefaultLang(this.globals.language);
    this.sepaTransactionForm = this.formBuilder.group({});
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subRoute = this.activatedRoute.paramMap.subscribe(async (params: any) => {
      const data = JSON.parse(params.params.data);

      this.fromAddress = data.address;
      this.currencyCode = data.currencyCode;
      this.amount = data.amount;
    });
    this.subs.push(subRoute);
    this.getSepaRequisites(loading);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  private getSepaRequisites(loading) {
    this.fiatTransactionsService.getFiatTransactionsRequisites('swift').pipe(
      map((data: any) => data.data)
    ).subscribe(
      async (data) => {
        for (const [key] of Object.entries(data)) {
          this.sepaTransactionForm.addControl(key, new FormControl(null, Validators.required));
        }
        this.requisitesList = data;
        await loading.dismiss();
      },
      (error) => {
        this.notifications.showNotification(error.error.message, 'error', loading);
      }
    );
  }

  public async createSepaTransaction() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    const formValue = this.sepaTransactionForm.value;
    const body = Object.assign(formValue, {
      fromAddress: this.fromAddress,
      currencyCode: this.currencyCode,
      amount: this.amount,
    });

    await loading.present();
    const subCreateSepa = this.fiatTransactionsService.createSepaTransaction(body).subscribe((res: any) => {
      this.notifications.showNotification(res.message, 'success', loading);
      this.router.navigate(['/wallets']);
    }, (thrown) => {
      this.notifications.showNotification(thrown.error.message, 'error', loading);
    });
    this.subs.push(subCreateSepa);
  }

  public showApprovedModal() {
    return from(this.modalCtrl.create({
      component: FiatMaximalModalComponent,
      componentProps: {
        fromAddress: this.fromAddress,
        currencyCode: this.currencyCode,
        transactionType: 'swift'
      },
      backdropDismiss: true,
      animated: true,
      cssClass: 'max-approve',
      showBackdrop: true,
    })).pipe(
      mergeMap((modal) => {
        return from(modal.present()).pipe(
          mergeMap(() => {
            return from(modal.onDidDismiss());
          })
        )
      })
    ).subscribe((data) => {
      if (data.data) {
        if (Number(data.data) < 1) {
          this.notifications.showNotification('Minimum amount is 1', 'error');
        } else {
          this.sendMaximumSwiftAmount(data.data);
        }
      }
    });
  }

  public async sendMaximumSwiftAmount(amount: string) {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    const formValue = this.sepaTransactionForm.value;
    const body = Object.assign(formValue, {
      fromAddress: this.fromAddress,
      currencyCode: this.currencyCode,
      amount: amount,
    });

    await loading.present();
    const subCreateSepa = this.fiatTransactionsService.createSepaTransaction(body).subscribe((res: any) => {
      this.notifications.showNotification(res.message, 'success', loading);
      this.router.navigate(['/wallets']);
    }, (thrown) => {
      this.notifications.showNotification(thrown.error.message, 'error', loading);
    });
    this.subs.push(subCreateSepa);
  }

  public goBack() {
    this.navCtrl.back();
  }
}
