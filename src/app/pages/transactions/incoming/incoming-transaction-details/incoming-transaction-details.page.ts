import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { NotificationsService } from '../../../../services/notifications.service';
import { CryptoTransactionsService } from '../../../../services/crypto-transactions.service';
import { FiatTransactionsService } from '../../../../services/fiat-transactions.service';
import { Globals } from '../../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-incoming-transaction-details',
  templateUrl: './incoming-transaction-details.page.html',
  styleUrls: ['./incoming-transaction-details.page.scss'],
})
export class IncomingTransactionDetailsPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private id: string;
  private currencyType: string;
  public transaction: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private notifications: NotificationsService,
    private cryptoTransactionsService: CryptoTransactionsService,
    private fiatTransactionsService: FiatTransactionsService,
    private loadingCtrl: LoadingController,
    private clipboard: Clipboard,
    private globals: Globals,
    private translate: TranslateService,
    private modalCtrl: ModalController,
    private iab: InAppBrowser
  ) {
    this.translate.setDefaultLang(this.globals.language);

    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      this.id = params.get('id');
      this.currencyType = params.get('type');
    });
    this.subs.push(subRoute);
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    if (this.currencyType === 'fiat') {
      const subGetInFiat = this.fiatTransactionsService.getIncomingFiatTransactionsDetails(this.id).subscribe(
        async (data: any) => {
          this.transaction = data.data;
          await loading.dismiss();

        },
        async (thrown) => {
          await this.notifications.showNotification(thrown.error.message, 'error', loading);
        }
      );
      this.subs.push(subGetInFiat);
    } else {
      const subGetInCrypto = this.cryptoTransactionsService.getIncomingCryptoTransactionDetails(this.id).subscribe(
        async (data: any) => {
          this.transaction = data.data;
          await loading.dismiss();

        },
        async (thrown) => {
          await this.notifications.showNotification(thrown.error.message, 'error', loading);
        }
      );
      this.subs.push(subGetInCrypto);
    }
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public successCopy(text: string) {
    this.clipboard.copy(text);
    this.notifications.showNotification('addressCopied', 'success');
  }

  public openWithSystemBrowser(hash: string, currencyCode: string){
    const target = '_system';
    let url = `https://www.blockchain.com/${currencyCode.toLowerCase()}/tx/${hash}`;
    
    if (currencyCode.toLowerCase() === 'ltc') {
      url = `https://live.blockcypher.com/${currencyCode.toLowerCase()}/tx/${hash}`;
    }

    this.iab.create(url, target);
  }

  public async closeModal() {
    await this.modalCtrl.dismiss();
  }
}
