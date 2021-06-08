import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Globals } from '../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private translatedMessage: any;
  public showItem: boolean;

  constructor(
    private alertCtrl: AlertController,
    private router: Router,
    private zone: NgZone,
    private globals: Globals,
    private translate: TranslateService,
    private storage: NativeStorage,
    private navCtrl: NavController
  ) {
    this.translate.setDefaultLang(this.globals.language);
    const subRoute = this.translate.getTranslation(this.globals.language).subscribe((messages) => {
      this.translatedMessage = messages;
    });
    this.subs.push(subRoute);

    this.showItem = environment.SHOW_LANGUAGE_ITEM;
  }

  ngOnInit() {}

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
   }

  public openChangePasswordModal() {
    this.router.navigate(['/change-password']);
  }

  public openTypeOfVerificationModal() {
    this.router.navigate(['/change-type-of-verification']);
  }

  public openNotificationModal() {
    this.router.navigate(['/change-notifications']);
  }


  public openFingerprintModal() {
    this.router.navigate(['/fingerprint']);
  }

  public openActivityModal() {
    this.router.navigate(['/activity']);
  }

  public openChangeLanguageModal() {
    this.router.navigate(['/change-language'])
  }

  public async logout() {
    const alert = await this.alertCtrl.create({
      header: this.translatedMessage.settings.logout,
      message: this.translatedMessage.settings.logoutNotification,
      buttons: [
        {
          text: this.translatedMessage.common.cancel,
          handler: () => {}
        },
        {
          text: this.translatedMessage.settings.logout,
          handler: async () => {
            await this.storage.clear();
            this.zone.run(
              () => this.router.navigate(['/sign-in'])
            );
          }
        }
      ]
    });

    await alert.present();
  }

  public goBack() {
    this.navCtrl.back();
  }
}
