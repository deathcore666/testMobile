import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../../../services/globals.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { NotificationsService } from '../../../../services/notifications.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-requisites',
  templateUrl: './requisites.page.html',
  styleUrls: ['./requisites.page.scss'],
})
export class RequisitesPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public requisites = {};

  constructor(
    private navCtrl: NavController,
    private translate: TranslateService,
    private globals: Globals,
    private activatedRoute: ActivatedRoute,
    private clipboard: Clipboard,
    private notifications: NotificationsService
  ) {
    this.translate.setDefaultLang(this.globals.language);
  }

  ngOnInit() {
    const subRoute = this.activatedRoute.paramMap.subscribe((data: any) => {
      this.requisites = JSON.parse(data.params.data);
    });
    this.subs.push(subRoute);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public successCopy(text: string) {
    this.clipboard.copy(text);
    this.notifications.showNotification('successCopied', 'success');
  }

  public goBack() {
    this.navCtrl.back();
  }
}
