import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { FiatWalletsService } from '../../../services/fiat-wallets.service';
import { InfoService } from '../../../services/info.service';
import { NotificationsService } from '../../../services/notifications.service';
import { Globals } from '../../../services/globals.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-fiat-wallet-details',
  templateUrl: './fiat-wallet-details.page.html',
  styleUrls: ['./fiat-wallet-details.page.scss'],
})
export class FiatWalletsDetailsPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public cardForm: FormGroup;
  private routerData: { address: string, currencyCode: string };
  public wallet: any;
  public accountQrCode: any;
  public isCreditCard: boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fiatWalletsService: FiatWalletsService,
    private infoService: InfoService,
    private notifications: NotificationsService,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private clipboard: Clipboard,
    private sanitization: DomSanitizer,
    private globals: Globals,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private iab: InAppBrowser,
  ) { 
    this.translate.setDefaultLang(this.globals.language);
    this.isCreditCard = environment.BUY_WITH_CARD;
    
    const subRoute = this.activatedRoute.paramMap.subscribe((params: Params) => {
      this.routerData = params.params;
    });
    this.subs.push(subRoute);

    this.cardForm = formBuilder.group({
      amount: [null, Validators.compose([Validators.required, Validators.min(1), Validators.max(1000000)])]
    });
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    this.getIbanDetails(loading);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async successCopy(text: string) {
    await this.clipboard.copy(text);
    await this.notifications.showNotification('Account number has been copied', 'success');
  }

  public openSendCoinsModal(wallet: any) {
    const data = {
      address: wallet.address,
      currencyCode: wallet.currencyCode,
      currencyType: wallet.currencyType
    };

    this.router.navigate(['/generate-fiat-transaction', { data: JSON.stringify(data) }]);
  }

  public openRequestCoinsModal(address: string, currency: string) {
    this.router.navigate(['/request-coins', { address: address, currency: currency }]);
  }

  public openRenameWalletModal() {
    this.router.navigate(['/rename-wallet', { wallet: JSON.stringify(this.wallet) }]);
  }

  public async refresh(refresher) {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    this.getIbanDetails(loading);
    refresher.target.complete();
  }

  public getRequisites() {
    const data = JSON.stringify(this.wallet.requisites);
    this.router.navigate(['/requisites', { data }]);
  }

  public getIbanDetails(loading) {
    const subGetFiat = this.fiatWalletsService.getFiatWalletDetails(this.routerData.currencyCode, this.routerData.address).subscribe(
      async (data: any) => {
        this.wallet = data.data;
        this.getAccountQrCode();

        await loading.dismiss();
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subGetFiat);
  }

  private getAccountQrCode() {
    const subGetQrCode = this.infoService.getQrCode(this.routerData.address, this.wallet.currencyCode).subscribe(
      (data: any) => {
        this.accountQrCode = this.sanitization.bypassSecurityTrustStyle(`url(data:image/png;base64,${data.data})`);
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error');
      }
    );
    this.subs.push(subGetQrCode);
  }

  public goBack() {
    this.navCtrl.back();
  }

  public async buyWithCard(address: string, currencyCode: string) {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const requestBody = {
      address: address,
      currencyCode: currencyCode,
      amount: this.cardForm.get('amount').value
    };

    this.fiatWalletsService.buyFiatWithCard(requestBody).pipe(
      map((data: any) => data.data)
    ).subscribe(
      (res) => {
        loading.dismiss();
        const urlF = res.url + '?redirectUrl=' + encodeURIComponent('https://pay.omnipay.uk');
        this.iab.create(urlF, "_system", "hidden=no,zoom=no,location=no,clearsessioncache=no,clearcache=no");
      },
      (error) => {
        loading.dismiss();
        this.notifications.showNotification(error.error.message, 'error');
      }
    );
  }
}
