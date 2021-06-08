import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';

import { FiatWalletsService } from '../../../services/fiat-wallets.service';
import { ProfileService } from '../../../services/profile.service';
import { NotificationsService } from '../../../services/notifications.service';

import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-generate-fiat-wallet',
  templateUrl: './generate-fiat-wallet.page.html',
  styleUrls: ['./generate-fiat-wallet.page.scss'],
})

export class GenerateFiatWalletPage implements OnInit, OnDestroy {
  public customAlertOptions: any = {
    header: 'Currency',
  };
  private subs: Subscription[] = [];
  public fiatWalletForm: FormGroup;
  public availableList: any[];
  public walletName: string;
  public choosenCurrency: any;
  public profile: any;

  constructor(
    public navCtrl: NavController,
    private router: Router,
    private fiatWalletsService: FiatWalletsService,
    private profileService: ProfileService,
    private notifications: NotificationsService,
    private loadingCtrl: LoadingController,
    private globals: Globals,
    private translate: TranslateService,
    private formBuilder: FormBuilder
  ) {
    this.translate.setDefaultLang(this.globals.language);

    this.fiatWalletForm = this.formBuilder.group({
      currencyCode: [null, Validators.required],
      name: [null, Validators.compose([
        Validators.required,
        Validators.pattern("^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$"),
        Validators.minLength(3)
      ])]
    });
  }

  async ngOnInit() {
    await this.getProfile();
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async generateNewWallet() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();
    
    const subGenerateWallet = this.fiatWalletsService.generateFiatWallet(this.fiatWalletForm.value).subscribe(() => {
      this.router.navigate(['/wallets'], { replaceUrl: true });
      this.notifications.showNotification('accountSuccessfulyCreated', 'success', loading);
    }, (thrown) => {
      this.notifications.showNotification(thrown.error.message, 'error', loading);
    });
    this.subs.push(subGenerateWallet);
  }


  private async getProfile() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });

    await loading.present();

    const subGetProfile = this.profileService.getProfile().subscribe(async (res: any) => {
      this.availableList = res.data.availableCurrencies;
      this.profile = res.data;
    
      if (!res.data.profile && !res.data.documents) {
        await loading.dismiss();
        this.router.navigate(['/update-profile']);
      } else if (res.data.profile && !res.data.documents) {
        await loading.dismiss();
        this.router.navigate(['/documents']);
      }

      await loading.dismiss();
    }, (thrown) => {
      this.notifications.showNotification(thrown.error.message, 'error', loading);
    });
    this.subs.push(subGetProfile);
  }

  public isControlStatus(controlName: string, status: string) {
    const control = this.fiatWalletForm.get(controlName);
    return control.dirty && control[status];
  }

  public goBack() {
    this.navCtrl.back();
  }
}
