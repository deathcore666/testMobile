import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { Globals } from '../../../../services/globals.service';

@Component({
  selector: 'app-deposit-details',
  templateUrl: './deposit-details.page.html',
  styleUrls: ['./deposit-details.page.scss'],
})
export class DepositDetailsPage implements OnDestroy {
  private subs: Subscription[] = [];
  public deposit: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private globals: Globals,
    private translate: TranslateService,
    private modalCtrl: ModalController
  ) {
    this.translate.setDefaultLang(this.globals.language);

    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      this.deposit = JSON.parse(params.get('deposit'));
    });
    this.subs.push(subRoute);
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
