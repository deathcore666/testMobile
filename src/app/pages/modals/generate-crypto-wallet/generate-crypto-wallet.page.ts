import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';

import { CurrencyService } from '../../../services/currency.service';
import { CryptoWalletsService } from '../../../services/crypto-wallets.service';
import { NotificationsService } from '../../../services/notifications.service';
import { HelpersService } from '../../../services/helpers.service';
import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-generate-crypto-wallet',
  templateUrl: './generate-crypto-wallet.page.html',
  styleUrls: ['./generate-crypto-wallet.page.scss'],
})
export class GenerateCryproWalletPage implements OnInit, OnDestroy {
  public customAlertOptions: any = {
    header: 'Currency',
  };
  private subs: Subscription[] = [];
  public currenciesList = [];
  public choosenCurrencyCode: string;
  public currencyId: string;
  public cryptoWalletForm: FormGroup;

  constructor(
    private router: Router,
    private currencyService: CurrencyService,
    private cryptoWalletsService: CryptoWalletsService,
    private notifications: NotificationsService,
    private helpers: HelpersService,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private globals: Globals,
    private translate: TranslateService,
    private formBuilder: FormBuilder
  ) {
    this.translate.setDefaultLang(this.globals.language);

    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      if (JSON.parse(params.get('currency'))) {
        this.currencyId = JSON.parse(params.get('currency'))._id;
      }
    });
    this.subs.push(subRoute);

    this.cryptoWalletForm = this.formBuilder.group({
      currencyCode: [null, Validators.required],
      name: [null, Validators.compose([
        Validators.required,
        Validators.pattern("^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$"),
        Validators.minLength(3)
      ])]
    });
  }

  ngOnInit() {
    this.getCurrencies();
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async generateNewWallet() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subGenerateCrypto = this.cryptoWalletsService.generateCryptoWallet(this.cryptoWalletForm.value).subscribe(
      () => {
        this.notifications.showNotification('accountSuccessfulyCreated', 'success', loading);
        this.router.navigate(['/wallets'], { replaceUrl: true });
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subGenerateCrypto);
  }

  private async getCurrencies() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subGetCrypto = this.currencyService.getCryptoCurrencies().subscribe(async (data: any) => {
      this.currenciesList = this.helpers.sort(data.data, 'name');

      this.currenciesList.forEach((res) => {
        if (this.currencyId === res._id) {
          this.choosenCurrencyCode = res.code;
        }
      });

      await loading.dismiss();
    }, (thrown) => {
      this.notifications.showNotification(thrown.error.message, 'error', loading);
    });
    this.subs.push(subGetCrypto);
  }

  public isControlStatus(controlName: string, status: string) {
    const control = this.cryptoWalletForm.get(controlName);
    return control.dirty && control[status];
  }

  public goBack() {
    this.navCtrl.back();
  }
}
