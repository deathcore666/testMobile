import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';

import { ActivityService } from '../../../services/activity.service';
import { NotificationsService } from '../../../services/notifications.service';
import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
})
export class ActivityPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public activityList = [];

  constructor(
    private activityService: ActivityService,
    private notifications: NotificationsService,
    private loadingCtrl: LoadingController,
    private globals: Globals,
    private translate: TranslateService,
    private navCtrl: NavController
  ) {
    this.translate.setDefaultLang(this.globals.language);
  }

  ngOnInit() {
    this.getActivity();
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public refresh(refresher) {
    this.getActivity();
    refresher.target.complete();
  }

  public loadMore(event) {
    this.getActivity();
    event.target.complete();
  }

  private async getActivity() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const skip = this.activityList.length;

    const subGetActivity = this.activityService.getActivity(skip).subscribe(async (data: any) => {
      if (data.data.length === 0) {
        await loading.dismiss();
        return;
      }
      skip > 0 ? this.activityList.push(...data.data) : this.activityList = data.data;
      await loading.dismiss();
    }, async (thrown) => {
      await this.notifications.showNotification(thrown.error.message, 'error', loading);
    });
    this.subs.push(subGetActivity);
  }

  public goBack() {
    this.navCtrl.back();
  }
}
