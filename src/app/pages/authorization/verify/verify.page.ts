import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthorizationService } from '../../../services/authorization.service';
import { NotificationsService } from '../../../services/notifications.service';
import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.page.html',
  styleUrls: ['./verify.page.scss'],
})
export class VerifyPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public verifyAccountForm: FormGroup;
  private userEmail: any = '';
  public code: string;
  private codeFromEmail: string;
  public disabledButton = true;

  constructor(
    private authorizationService: AuthorizationService,
    private notifications: NotificationsService,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private storage: NativeStorage,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private globals: Globals,
    private translate: TranslateService,
    private formBuilder: FormBuilder
  ) { 
    this.translate.setDefaultLang(this.globals.language);

    this.verifyAccountForm = this.formBuilder.group({
      code: [null, Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6)])]
    });
    
    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      this.codeFromEmail = params.get('code');
        if (this.codeFromEmail) {
          this.verifyAccount();
        }
    });
    this.subs.push(subRoute);
  }

  async ngOnInit() {
    try {
      this.userEmail = await this.storage.getItem('email');
    } catch (error) {}
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async verifyAccount() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const code = this.verifyAccountForm.value.code;

    const requestBody = {
      email: this.userEmail,
      code: code ? code : this.codeFromEmail
    };

    const subVerify = this.authorizationService.verify(requestBody).subscribe(
      async (res: any) => {
        await this.storage.setItem('token', res.data.token);
        await this.storage.setItem('expire_at', res.data.expiration);
        await this.storage.setItem('acountAproved', true);
        await loading.dismiss();
        this.router.navigate(['/wallets']);
      },
      async (thrown) => {
        this.verifyAccountForm.reset();
        await this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subVerify);
  }

  public async resendVerifyCode() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subResendToken = this.authorizationService.resendToken(this.userEmail).subscribe(
      (data: any) => {
        this.notifications.showNotification(data.message, 'success', loading);
      },
      (thrown) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subResendToken);
  }

  public isControlStatus(controlName: string, status: string) {
    const control = this.verifyAccountForm.get(controlName);
    return control.dirty && control[status];
  }

  public goBack() {
    this.navCtrl.back();
  }
}
