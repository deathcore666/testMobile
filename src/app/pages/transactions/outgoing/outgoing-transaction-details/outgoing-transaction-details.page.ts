import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { NotificationsService } from '../../../../services/notifications.service';
import { CryptoTransactionsService } from '../../../../services/crypto-transactions.service';
import { FiatTransactionsService } from '../../../../services/fiat-transactions.service';

import { environment } from '../../../../../environments/environment';
import { Globals } from '../../../../services/globals.service';

@Component({
  selector: 'app-outgoing-transaction-details',
  templateUrl: './outgoing-transaction-details.page.html',
  styleUrls: ['./outgoing-transaction-details.page.scss'],
})
export class OutgoingTransactionDetailsPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private id: string;
  private currencyType: string;
  public transaction: any;
  public showVerifyButton = true;

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
      const subGetOutFiat = this.fiatTransactionsService.getOutgoingFiatTransactionsDetails(this.id).subscribe(
        async (data: any) => {
          this.transaction = data.data;
          await loading.dismiss();
        },
        async (thrown) => {
          await this.notifications.showNotification(thrown.error.message, 'error', loading);
        }
      );
      this.subs.push(subGetOutFiat);
    } else {
      const subGetOutCrypto = this.cryptoTransactionsService.getOutgoingCryptoTransactionDetails(this.id).subscribe(
        async (data: any) => {
          this.transaction = data.data;

          if (this.transaction.type === 'blockchain' && this.transaction.blockchainHash) {
            this.showVerifyButton = false;
          }
          await loading.dismiss();
        },
        async (thrown) => {
          await this.notifications.showNotification(thrown.error.message, 'error', loading);
        }
      );
      this.subs.push(subGetOutCrypto);
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

  public verifyInBlockchain() {
    const urlExploler = `${environment[this.transaction.currencyCode + '_EXPLORER']}${this.transaction.blockchainHash}`;
    this.iab.create(urlExploler, "_system", "hidden=no,zoom=no,location=no,clearsessioncache=no,clearcache=no");
  }

  public showTips() {
    this.notifications.showNotification('showTips', 'success', false, 6000);
  }

  public async closeModal() {
    await this.modalCtrl.dismiss();
  }
}
