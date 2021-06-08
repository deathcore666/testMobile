import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { Globals } from '../../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-withdrawal-details',
  templateUrl: './withdrawal-details.page.html',
  styleUrls: ['./withdrawal-details.page.scss'],
})
export class WithdrawalDetailsPage implements OnDestroy {
  private subs: Subscription[] = [];
  public withdrawal: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private globals: Globals,
    private translate: TranslateService,
    private modalCtrl: ModalController
  ) {
    this.translate.setDefaultLang(this.globals.language);

    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      this.withdrawal = JSON.parse(params.get('withdrawal'));
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
