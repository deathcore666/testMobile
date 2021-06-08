import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthorizationService } from '../../../services/authorization.service';
import { NotificationsService } from '../../../services/notifications.service';
import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-registration',
  templateUrl: './confirm-registration.page.html',
  styleUrls: ['./confirm-registration.page.scss'],
})

export class ConfirmRegistrationPage implements OnInit, OnDestroy {
  public token: string;
  private subs: Subscription[] = [];

  constructor(
    private authorizationService: AuthorizationService,
    private notifications: NotificationsService,
    private loadingCtrl: LoadingController,
    private storage: NativeStorage,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private globals: Globals,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang(this.globals.language);
  }

  ngOnInit() {
    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      this.token = params.get('token'); 
    });
    this.subs.push(subRoute);
  }

  public async confirm() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subConfirm = this.authorizationService.confirmRegistration(this.token).subscribe(
      async (data: any) => {
        await this.storage.setItem('token', data.data.token);
        await this.storage.setItem('expire_at', data.data.expiration);
        await this.storage.setItem('acountAproved', true);
        await loading.dismiss();
        
        this.router.navigate(['/wallets']);
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subConfirm);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }
}
