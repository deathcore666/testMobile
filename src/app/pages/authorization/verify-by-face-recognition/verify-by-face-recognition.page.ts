import { Component, OnDestroy } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthorizationService } from '../../../services/authorization.service';
import { NotificationsService } from '../../../services/notifications.service';
import { PurchasesService } from '../../../services/purchases.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-verify-by-face-recognition',
  templateUrl: './verify-by-face-recognition.page.html',
  styleUrls: ['./verify-by-face-recognition.page.scss'],
})

export class VerifyByFaceRecognitionPage implements OnDestroy {
  private subs: Subscription[] = [];
  public token: string;
  public state: string;
  public error: any;
  public confirmPurchaseToken: string;

  constructor(
    private authorizationService: AuthorizationService,
    private notifications: NotificationsService,
    private purchasesService: PurchasesService,
    private loadingCtrl: LoadingController,
    private storage: NativeStorage,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      this.token = params.get('token');
      this.state = params.get('state');
      this.error = params.get('error') === 'false' ? false : true;
      this.confirmPurchaseToken = JSON.parse(params.get('confirmPurchaseToken'));
    });
    this.subs.push(subRoute);

    if (!this.error) {
      const subConfirmBio = this.authorizationService.confirmBioVerify(this.token.trim()).subscribe(
        async (data: any) => {
          await this.storage.setItem('token', data.data.token);
          await this.storage.setItem('expire_at', data.data.expiration);
          await loading.dismiss();

          if (this.confirmPurchaseToken && this.confirmPurchaseToken.length !== 0) {
            const subPurchase = this.purchasesService.assignPurchase(this.confirmPurchaseToken).subscribe((res: any) => {
              this.router.navigate(['/confirm-purchase', { token: res.token }]);
            }, (thrown) => {
            this.notifications.showNotification(thrown.error.message, 'error');
            this.router.navigate(['/sign-in']);
          });
          this.subs.push(subPurchase);
        }

        this.router.navigate(['/wallets']);
        },
        async (thrown) => {
          await this.notifications.showNotification(thrown.error.message, 'error');
          await this.clear(loading);
        }
      );
      this.subs.push(subConfirmBio);
    } else {
      await this.clear(loading);
    }
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }
  
  private async clear(loading) {
    await this.storage.remove('token');
    await this.storage.remove('expire_at');
    await loading.dismiss();
    this.router.navigate(['/sign-in']);
  }
}
