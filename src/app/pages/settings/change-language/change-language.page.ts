import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { SettingsService } from '../../../services/settings.service';
import { NotificationsService } from '../../../services/notifications.service';
import { Globals } from '../../../services/globals.service';
import { Subscription } from 'rxjs';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-change-language',
  templateUrl: './change-language.page.html',
  styleUrls: ['./change-language.page.scss'],
})
export class ChangeLanguagePage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public languagesList: any[];
  public changedLanguage: string;
  public language: string;

  constructor(
    public translate: TranslateService,
    private storage: NativeStorage,
    private settingsService: SettingsService,
    private notifications: NotificationsService,
    private globals: Globals,
    private navCtrl: NavController
  ) {
    this.translate.setDefaultLang(this.globals.language);
    this.changedLanguage = this.globals.language;

    this.languagesList = [
      { name: 'English', code: 'en' },
      { name: 'Hebrew', code: 'he' }
    ];
  }

  ngOnInit() {}

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public changeLanguage() {
    const subChangeLang = this.settingsService.changeLanguage(this.changedLanguage).subscribe(
      async (data: any) => {
        this.globals.language = this.changedLanguage;
        this.language = this.changedLanguage;
        this.translate.setDefaultLang(this.language);
        this.notifications.showNotification(data.message, 'success');

        await this.storage.setItem('language', this.language);
      },
      (error) => {
        this.notifications.showNotification(error.message, 'error');
      });
    this.subs.push(subChangeLang);
  }

  public goBack() {
    this.navCtrl.back();
  }
}
