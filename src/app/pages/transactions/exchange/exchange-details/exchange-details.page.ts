import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Clipboard } from '@ionic-native/clipboard/ngx';

import { NotificationsService } from '../../../../services/notifications.service';
import { Globals } from '../../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-exchange-details',
  templateUrl: './exchange-details.page.html',
  styleUrls: ['./exchange-details.page.scss'],
})
export class ExchangeDetailsPage implements OnDestroy {
  private subs: Subscription[] = [];
  public exchange: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private notifications: NotificationsService,
    private clipboard: Clipboard,
    private globals: Globals,
    private translate: TranslateService,
    private modalCtrl: ModalController
  ) {
    this.translate.setDefaultLang(this.globals.language);

    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      this.exchange = JSON.parse(params.get('exchange'));
    });
    this.subs.push(subRoute);
  }

  public successCopy(text: string) {
    this.clipboard.copy(text);
    this.notifications.showNotification('addressCopied', 'success');
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async closeModal() {
    await this.modalCtrl.dismiss();
  }
}
