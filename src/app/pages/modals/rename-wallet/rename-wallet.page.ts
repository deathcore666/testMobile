import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

import { CryptoWalletsService } from '../../../services/crypto-wallets.service';
import { FiatWalletsService } from '../../../services/fiat-wallets.service';
import { NotificationsService } from '../../../services/notifications.service';
import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-rename-wallet',
  templateUrl: './rename-wallet.page.html',
  styleUrls: ['./rename-wallet.page.scss'],
})
export class RenameWalletPage implements OnInit,OnDestroy {
  private subs: Subscription[] = [];
  public renameWalletForm: FormGroup;
  public wallet: any;

  constructor(
    private navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private notifications: NotificationsService,
    private cryptoWalletsService: CryptoWalletsService,
    private fiatWalletsService: FiatWalletsService,
    private globals: Globals,
    private translate: TranslateService,
    private formBuilder: FormBuilder
  ) {
    this.translate.setDefaultLang(this.globals.language);

    this.renameWalletForm = this.formBuilder.group({
      name: [null, Validators.compose([Validators.required, Validators.minLength(3)])]
    });
    
    const subRoute = this.activatedRoute.paramMap.subscribe((params) => {
      this.wallet = JSON.parse(params.get('wallet'));
      this.renameWalletForm.get('name').patchValue(this.wallet.name);
    });
    this.subs.push(subRoute);
  }

  ngOnInit() {}

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public change() {
    const name = this.renameWalletForm.get('name').value;
    if (this.wallet.currencyType === 'fiat' ) {
      const subChangeFiat = this.fiatWalletsService.changeFiatWalletName(this.wallet.currencyCode, this.wallet.address, name).subscribe(
        (data: any) => {
          this.notifications.showNotification('The name of the account has been successfully changed', 'success');
          this.navCtrl.back();
        },
        (thrown) => {
          this.notifications.showNotification(thrown.error.message, 'error');
        }
      );
      this.subs.push(subChangeFiat);
    } else {
      const subChangeCrypto = this.cryptoWalletsService.changeCryptoWalletName(this.wallet.currencyCode, this.wallet.address, name).subscribe(
        (data: any) => {
          this.notifications.showNotification(data.message, 'success');
          this.navCtrl.back();
        },
        (thrown) => {
          this.notifications.showNotification(thrown.error.message, 'error');
        }
      );
      this.subs.push(subChangeCrypto);
    }
  }

  public isControlStatus(controlName: string, status: string) {
    const control = this.renameWalletForm.get(controlName);
    return control.dirty && control[status];
  }

  public goBack() {
    this.navCtrl.back();
  }

  public setTitle() {
    return this.wallet.currencyType === 'fiat' ? 'renameAccount.titleFiat' : 'renameAccount.titleCrypto';
  }

  public setLabel() {
    return this.wallet.currencyType === 'fiat' ? 'renameAccount.labelFiat' : 'renameAccount.labelCrypto';
  }
}
