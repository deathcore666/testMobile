import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, LoadingController, ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Clipboard } from '@ionic-native/clipboard/ngx';

import { CryptoWalletsService } from '../../../services/crypto-wallets.service';
import { InfoService } from '../../../services/info.service';
import { NotificationsService } from '../../../services/notifications.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, from } from 'rxjs';
import { TransactionsByAddressComponent } from './transactions-by-address/transactions-by-address.component';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-crypto-wallet-details',
  templateUrl: './crypto-wallet-details.page.html',
  styleUrls: ['./crypto-wallet-details.page.scss'],
})
export class CryptoWalletDetailsPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private address: string;
  public wallet: any;
  public accountQrCode: any;
  public transactions: any[];

  constructor(
    public navCtrl: NavController,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cryptoWalletsService: CryptoWalletsService,
    private infoService: InfoService,
    private notifications: NotificationsService,
    private loadingCtrl: LoadingController,
    private clipboard: Clipboard,
    private sanitization: DomSanitizer,
    private globals: Globals,
    private translate: TranslateService,
    private modalCtrl: ModalController,
  ) {
    this.translate.setDefaultLang(this.globals.language);

    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      this.address = params.get('address');
    });
    this.subs.push(subRoute);
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    this.getWalletDetails(loading);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public successCopy(text: string) {
    this.clipboard.copy(text);
    this.notifications.showNotification('Wallet address has been copied', 'success');
  }

  public openSendCoinsModal(wallet: any) {
    const data = {
      address: wallet.address,
      currencyCode: wallet.currencyCode
    };

    this.router.navigate(['/generate-crypto-transaction', { data: JSON.stringify(data) }]);
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

    this.getWalletDetails(loading);
    refresher.target.complete();
  }

  public getWalletDetails(loading) {
    const subGetCrypto = this.cryptoWalletsService.getCryptoWalletDetails(this.address).subscribe(
      async (data: any) => {
        this.wallet = data.data;
        this.getAccountQrCode();
        await loading.dismiss();
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subGetCrypto);
  }

  private getAccountQrCode() {
    const subGetQrCode = this.infoService.getQrCode(this.address, this.wallet.currencyCode).subscribe(
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

  public openTransactions() {
    return from(this.modalCtrl.create({
      component: TransactionsByAddressComponent,
      componentProps: { walletAddress: this.wallet.address },
      backdropDismiss: false,
      animated: true,
      showBackdrop: true,
      cssClass: 'searchbar-modal'
    })).pipe(
      mergeMap((modal) => {
        return from(modal.present())
      })
    ).subscribe();
  }
}
