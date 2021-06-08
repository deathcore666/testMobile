import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';

import { FiatTransactionsService } from '../../../../services/fiat-transactions.service';
import { NotificationsService } from '../../../../services/notifications.service';
import { Globals } from '../../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-swift-transaction',
  templateUrl: './swift-transaction.page.html',
  styleUrls: ['./swift-transaction.page.scss'],
})

export class SwiftTransactionPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public fromAddress: string;
  public currencyCode: string;
  public amount: number;

  public swiftTransactionForm: FormGroup;
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
  ) {
    this.translate.setDefaultLang(this.globals.language);
    this.swiftTransactionForm = this.formBuilder.group({});
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
    this.getSwiftRequisites(loading);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  private getSwiftRequisites(loading) {
    this.fiatTransactionsService.getFiatTransactionsRequisites('swift').pipe(
      map((data: any) => data.data)
    ).subscribe(
      async (data) => {
        for (const [key] of Object.entries(data)) {
          this.swiftTransactionForm.addControl(key, new FormControl(null, Validators.required));
        }
        this.requisitesList = data;
        await loading.dismiss();
      },
      (error) => {
        this.notifications.showNotification(error.error.message, 'error', loading);
      }
    );
  }

  public async createSwiftTransaction() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    const formValue = this.swiftTransactionForm.value;
    const body = Object.assign(formValue, {
      fromAddress: this.fromAddress,
      currencyCode: this.currencyCode,
      amount: this.amount,
    });

    await loading.present();
    const subCreateSwift = this.fiatTransactionsService.createSwiftTransaction(body).subscribe((res: any) => {
      this.notifications.showNotification(res.message, 'success', loading);
      this.router.navigate(['/wallets']);
    }, (thrown) => {
      this.notifications.showNotification(thrown.error.message, 'error', loading);
    });
    this.subs.push(subCreateSwift);
  }

  public goBack() {
    this.navCtrl.back();
  }
}
