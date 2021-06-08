import { Component, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, ModalController } from '@ionic/angular';
import { mergeMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, from } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { CryptoTransactionsService } from '../../../services/crypto-transactions.service';
import { NotificationsService } from '../../../services/notifications.service';
import { Globals } from '../../../services/globals.service';

@Component({
  selector: 'app-generate-crypto-transaction',
  templateUrl: './generate-crypto-transaction.page.html',
  styleUrls: ['./generate-crypto-transaction.page.scss'],
})

export class GenerateCryptoTransactionPage implements OnDestroy {
  private subs: Subscription[] = [];
  public cryptoForm: FormGroup;
  private fromAddress: string;
  private currencyCode: string;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cryptoTransactionsService: CryptoTransactionsService,
    private notifications: NotificationsService,
    private loadingCtrl: LoadingController,
    private globals: Globals,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
  ) {
    this.translate.setDefaultLang(this.globals.language);

    const subRoute = this.activatedRoute.paramMap.subscribe((params: any) => {
      const data = JSON.parse(params.params.data);
      this.fromAddress = data.address;
      this.currencyCode = data.currencyCode;
    });
    this.subs.push(subRoute);

    this.cryptoForm = this.formBuilder.group({
      toAddress: [null, Validators.compose([Validators.required, Validators.pattern("^[a-zA-Z0-9]*$")])],
      amount: [null, Validators.compose([
        Validators.required,
        Validators.min(0.000001),
        Validators.pattern("^[0-9]+(\.[0-9]{1,8})?$")
      ])],
      notes: [null]
    });
   }

  public async send() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const form = this.cryptoForm.value;
    const requestBody = {
      fromAddress: this.fromAddress,
      toAddress: form.toAddress,
      amount: Number(form.amount),
      currencyCode: this.currencyCode,
      notes: form.notes
    };

    this.removeNotesField(requestBody);

    const subCreateCrypto = this.cryptoTransactionsService.createCryptoTransactions(requestBody)
      .subscribe((data: any) => {
        this.notifications.showNotification(data.message, 'success', loading);
        this.navCtrl.back();
      }, (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subCreateCrypto);
  }

  public async getMaximumCryptoAmount() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const requestBody = {
      fromAddress: this.fromAddress,
      toAddress: this.cryptoForm.get('toAddress').value,
      currencyCode: this.currencyCode,
    };

    this.cryptoTransactionsService.createMaxCryptoTransactions(requestBody).subscribe(
      async (availableAmount: any) => {
        this.cryptoForm.get('amount').patchValue(Number(availableAmount.data));
        await loading.dismiss();
      },
      (error) => {
        this.notifications.showNotification(error.error.message, 'error', loading);
      }
    );
  }

  public openScanner() {
    this.router.navigate(['/qr-scanner']);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public isControlStatus(controlName: string, status: string) {
    const control = this.cryptoForm.get(controlName);
    return control.dirty && control[status];
  }

  private removeNotesField(object) {
    for (let key in object) {
      if (object[key] === null || object[key] === '') {
        delete object[key];
      }
    }
  }

  public goBack() {
    this.navCtrl.back();
  }
}
