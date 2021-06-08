import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { LoadingController, NavController } from '@ionic/angular';

import { NotificationsService } from '../../../services/notifications.service';
import { AuthorizationService } from '../../../services/authorization.service';
import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fingerprint',
  templateUrl: './fingerprint.page.html',
  styleUrls: ['./fingerprint.page.scss'],
})
export class FingerprintPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public message: string;
  public showButtonForChange = false;
  public isPinCodeSet: boolean;
  public authType: string;
  public disabledFingerPrintFeature: boolean;

  constructor(
    private router: Router,
    private storage: NativeStorage,
    private loadingCtrl: LoadingController,
    private authorizationService: AuthorizationService,
    private notifications: NotificationsService,
    private globals: Globals,
    private translate: TranslateService,
    private navCtrl: NavController
  ) {
    this.translate.setDefaultLang(this.globals.language);
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    try {
      this.disabledFingerPrintFeature = await this.storage.getItem('disabledFingerPrintFeature');
      
      if (this.disabledFingerPrintFeature) {
        this.message = `Fingerprint isn't available on your device.`;
      }
    } catch (error) {}

    let email;
    try {
      email = await this.storage.getItem('email');
      
      const subGetAuthType = this.authorizationService.getAuthType(email).subscribe(
        async (data: any) => {
          this.authType = data.data;
  
          try {
            this.isPinCodeSet = await this.storage.getItem('pinCode');
          } catch (error) {
            this.isPinCodeSet = false;
            await loading.dismiss();
          }
  
          if (this.isPinCodeSet) {
            this.message = 'If you want to change a pin code - click on the button below.';
            this.showButtonForChange = true;
            await loading.dismiss();
          }
  
          await loading.dismiss();
        },
        async (thrown) => {
          await this.notifications.showNotification(thrown.error.message, 'error', loading);
        }
      );
      this.subs.push(subGetAuthType);
    } catch { 
      await loading.dismiss(); 
    }
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async togglePinCode() {
    let storagePinCode;
    try {
      storagePinCode = await this.storage.getItem('pinCode');
    } catch (error) {
      return storagePinCode = false;
    }

    if (!this.isPinCodeSet) {
      this.showButtonForChange = false;
      return this.showPincodeWindow('confirm');
    } else if (this.isPinCodeSet && storagePinCode) {
      this.showButtonForChange = true;
      return;
    } else {
      this.showButtonForChange = true;
      return this.showPincodeWindow('add');
    }
  }

  public showPincodeWindow(event) {
    this.router.navigate(['/pin-code', { event: event }]);
  }

  public goBack() {
    this.navCtrl.back();
  }
}
