import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';

import { NotificationsService } from '../../services/notifications.service';
import { AuthorizationService } from '../../services/authorization.service';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../services/globals.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.component.html'
})

export class TabsComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public tabs: any[];

  constructor(
    private router: Router,
    private faio: FingerprintAIO,
    private alertCtrl: AlertController,
    private notifications: NotificationsService,
    private authorizationService: AuthorizationService,
    private storage: NativeStorage,
    private zone: NgZone,
    private globals: Globals,
    private translate: TranslateService,
  ) {
    this.translate.setDefaultLang(this.globals.language);

    this.tabs = [
      { routerLink: '/wallets', icon: 'wallet', name: 'tabs.wallets' },
      { routerLink: '/exchange', icon: 'exchange', name: 'tabs.exchange' },
      { routerLink: '/transactions', icon: 'transactions', name: 'tabs.transactions' },
      { routerLink: '/requests', icon: 'requests', name: 'tabs.requests' }
    ];
  }

  async ngOnInit() {
    try {
      const email = await this.storage.getItem('email');
      this.getAuthType(email);
    } catch {}
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  private async showPinCodePrompt() {
    const confirm = await this.alertCtrl.create({
      header: 'Using a fingerprint',
      message: `<p>Do you want to use a fingerprint or pin code as an authorization method?<p>`,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Later',
          handler: () => {
            this.storage.setItem('pinCode', false);
          }
        },
        {
          text: 'Agree',
          handler: async () => {
            await this.zone.run(
              () => this.router.navigate(['/pin-code', { event: 'add', from: 'tabs' }])
            );
          }
        }
      ]
    });

    await confirm.present();
  }

  private getAuthType(email) {
    const subGetAuth = this.authorizationService.getAuthType(email).subscribe((data: any) => {
      if (data.data !== 'bio') {
        this.faio.isAvailable().then(
          async () => {
            try {
              await this.storage.getItem('pinCode');
            } catch (error) {
              await this.showPinCodePrompt();
            }

            await this.storage.setItem('disabledFingerPrintFeature', false);
          }, async () => {
            await this.storage.setItem('disabledFingerPrintFeature', true);
          }
        ).catch((thrown) => {
          this.notifications.showNotification(thrown.error.message, 'error');
        });
      }
    }, (thrown) => {
      this.notifications.showNotification(thrown.error.message, 'error');
    });
    this.subs.push(subGetAuth);
  }

  public getTabImageSource(tab: any): string {
    if (this.router.url.indexOf(tab.routerLink) === 0) {
      return `assets/images/tab-icons/${tab.icon}_active.svg`;
    }
    return `assets/images/tab-icons/${tab.icon}.svg`;
  }
}
