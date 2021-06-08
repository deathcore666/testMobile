import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../../services/globals.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-waiting-live-kyc',
  templateUrl: './waiting-live-kyc.page.html',
  styleUrls: ['./waiting-live-kyc.page.scss'],
})
export class WaitingLiveKycPage implements OnInit {
  constructor(
    private translate: TranslateService,
    private globals: Globals,
    private navCtrl: NavController
  ) {
    this.translate.setDefaultLang(this.globals.language)
  }

  ngOnInit() {}

  public goBack() {
    this.navCtrl.back();
  }
}
