import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { NavController } from '@ionic/angular';

import { SettingsService } from '../../../services/settings.service';
import { NotificationsService } from '../../../services/notifications.service';
import { Globals } from '../../../services/globals.service';
import { PushNotificationService } from '../../../services/push-notification.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-change-notifications',
  templateUrl: './change-notifications.page.html',
  styleUrls: ['./change-notifications.page.scss'],
})

export class ChangeNotificationsPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public userSettings: any;
  public isAvailablePush: boolean;

  constructor(
    private settingsService: SettingsService,
    private notifications: NotificationsService,
    private pushService: PushNotificationService,
    private globals: Globals,
    private translate: TranslateService,
    private navCtrl: NavController,
  ) {
    this.isAvailablePush = environment.SHOW_PUSH;
    this.translate.setDefaultLang(this.globals.language);
  }

  ngOnInit() {
    this.getUserSettings();
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public changeEmailNotification(type: string) {
    const subChangeNotific = this.settingsService.changeNotificationStatus(`${type}Notify`).subscribe(
      (data: any) => {
        this.notifications.showNotification(data.message, 'success');
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error');
      }
    );
    this.subs.push(subChangeNotific);
  }

  private getUserSettings() {
    const subGetUserSetting = this.settingsService.getUserSettings().subscribe(
      (data: any) => {
        this.userSettings = data.data;
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error');
      }
    );
    this.subs.push(subGetUserSetting);
  }

  public goBack() {
    this.navCtrl.back();
  }
}
