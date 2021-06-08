import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Clipboard } from '@ionic-native/clipboard/ngx';

import { RequestsService } from '../../../../services/requests.service';
import { NotificationsService } from '../../../../services/notifications.service';
import { Globals } from '../../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-outcome-request-details',
  templateUrl: './outcome-request-details.page.html',
  styleUrls: ['./outcome-request-details.page.scss'],
})
export class OutcomeRequestDetailsPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private id: string;
  public outcomeRequest: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private requestsService: RequestsService,
    private notifications: NotificationsService,
    private clipboard: Clipboard,
    private globals: Globals,
    private translate: TranslateService,
    private modalCtrl: ModalController
  ) {
    this.translate.setDefaultLang(this.globals.language);

    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      this.id = params.get('outcomeRequestId'); 
    });
    this.subs.push(subRoute);
  }

  ngOnInit() {
    this.getCoinRequestDetails();
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

  private getCoinRequestDetails() {
    const subGetCoins = this.requestsService.getCoinRequestDetails(this.id).subscribe(
      (result: any) => {
        this.outcomeRequest = result.data;
      }, 
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error');
      }
    );
    this.subs.push(subGetCoins);
  }

  public async closeModal() {
    await this.modalCtrl.dismiss();
  }
}
