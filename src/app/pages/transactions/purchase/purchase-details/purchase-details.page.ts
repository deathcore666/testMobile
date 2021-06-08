import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { LoadingController, ModalController } from '@ionic/angular';

import { NotificationsService } from '../../../../services/notifications.service';
import { PurchasesService } from '../../../../services/purchases.service';
import { Globals } from '../../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-purchase-details',
  templateUrl: './purchase-details.page.html',
  styleUrls: ['./purchase-details.page.scss'],
})

export class PurchaseDetailsPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public purchase: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private notifications: NotificationsService,
    private purchasesService: PurchasesService,
    private clipboard: Clipboard,
    private loadingCtrl: LoadingController,
    private globals: Globals,
    private translate: TranslateService,
    private modalCtrl: ModalController
  ) {
    this.translate.setDefaultLang(this.globals.language);

    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      this.purchase = JSON.parse(params.get('purchase'));
    });
    this.subs.push(subRoute);
  }

  ngOnInit() { }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public successCopy(text: string) {
    this.clipboard.copy(text);
    this.notifications.showNotification('addressCopied', 'success');
  }

  public async closeModal() {
    await this.modalCtrl.dismiss();
  }
}
