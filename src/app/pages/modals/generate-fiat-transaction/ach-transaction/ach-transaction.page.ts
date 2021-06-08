import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  NavController,
  LoadingController,
  ModalController,
  AlertController
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Globals } from '../../../../services/globals.service';
import { NotificationsService } from '../../../../services/notifications.service';
import { FiatTransactionsService } from '../../../../services/fiat-transactions.service';
import { SearchbarModalComponent } from '../../../../shared/searchbar-modal/searchbar-modal.component';
import { ProvinceCodesService } from '../../../../services/province-codes.service';
import { InfoService } from '../../../../services/info.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ach-transaction',
  templateUrl: './ach-transaction.page.html',
  styleUrls: ['./ach-transaction.page.scss']
})
export class AchTransactionPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public personalForm: FormGroup;
  public businessFrom: FormGroup;
  public accountType: string;
  public stateList: any;
  public countryList: any;
  public choosenItemFromModal: string;

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private activatedRoute: ActivatedRoute,
    private notifications: NotificationsService,
    private globals: Globals,
    private router: Router,
    private translate: TranslateService,
    private storage: NativeStorage,
    private formBuilder: FormBuilder,
    private fiatTransactionsService: FiatTransactionsService,
    private modalController: ModalController,
    private provinceCodeService: ProvinceCodesService,
    private infoService: InfoService
  ) {
    this.translate.setDefaultLang(this.globals.language);

    this.personalForm = this.formBuilder.group({
      fromWallet: [null, Validators.required],
      currencyCode: [null, Validators.required],
      amount: [null, Validators.required],
      accountState: [null, Validators.required],
      accountRoutingCode: [null, Validators.required],
      accountPostalCode: [null, Validators.required],
      accountNumber: [null, Validators.required],
      accountName: [null, Validators.required],
      accountCity: [null, Validators.required],
      accountAdress: [null, Validators.required],
      notes: [null]
    });

    this.businessFrom = this.formBuilder.group({
      fromWallet: [null, Validators.required],
      currencyCode: [null, Validators.required],
      amount: [null, Validators.required],
      createdCountry: [null, Validators.required],
      companyName: [null, Validators.required],
      accountRoutingCode: [null, Validators.required],
      accountNumber: [null, Validators.required],
      accountName: [null, Validators.required],
      accountCity: [null, Validators.required],
      accountAdress: [null, Validators.required],
      notes: [null]
    });
  }

  async ngOnInit() {
    this.stateList = this.provinceCodeService.getStates();
    this.accountType = await this.storage.getItem('profileType');

    this.getCountries();

    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subRoute = this.activatedRoute.paramMap.subscribe(async (params: any) => {
      const data = JSON.parse(params.params.data);

      this.personalForm.get('fromWallet').patchValue(data.address);
      this.personalForm.get('currencyCode').patchValue(data.currencyCode);
      this.personalForm.get('amount').patchValue(data.amount);
      this.personalForm.get('accountName').patchValue(data.accountName);
      this.businessFrom.get('fromWallet').patchValue(data.address);
      this.businessFrom.get('currencyCode').patchValue(data.currencyCode);
      this.businessFrom.get('amount').patchValue(data.amount);
      this.businessFrom.get('accountName').patchValue(data.accountName);

      await loading.dismiss();
    });
    this.subs.push(subRoute);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async createAchTransaction() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    if (this.accountType === 'personal') {
      this.removeNotesField(this.personalForm.value);
      const subCreatePersonal = this.fiatTransactionsService
        .createAchTransaction(this.accountType, this.personalForm.value)
        .subscribe(
          (res: any) => {
            this.notifications.showNotification(
              res.message,
              'success',
              loading
            );
            this.router.navigate(['/wallets']);
          },
          thrown => {
            this.notifications.showNotification(
              thrown.error.message,
              'error',
              loading
            );
          }
        );
      this.subs.push(subCreatePersonal);
    } else {
      this.removeNotesField(this.businessFrom.value);
      const subCreateBusiness = this.fiatTransactionsService
        .createAchTransaction(this.accountType, this.businessFrom.value)
        .subscribe(
          (res: any) => {
            this.notifications.showNotification(
              res.message,
              'success',
              loading
            );
            this.router.navigate(['/wallets']);
          },
          thrown => {
            this.notifications.showNotification(
              thrown.error.message,
              'error',
              loading
            );
          }
        );
      this.subs.push(subCreateBusiness);
    }
  }

  private removeNotesField(object) {
    for (let key in object) {
      if (object[key] === null || object[key] === '') {
        delete object[key];
      }
    }
  }

  private async getCountries() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subGetCountry = this.infoService.getCountries().subscribe(
      async (res: any) => {
        await loading.dismiss();
        this.countryList = res.data;
      },
      thrown => {
        this.notifications.showNotification(
          thrown.error.message,
          'error',
          loading
        );
      }
    );
    this.subs.push(subGetCountry);
  }

  public async openModal(array) {
    const componentProps = {
      array: array,
      item: null,
      title: 'States',
      from: 'documents'
    };

    const modal = await this.modalController.create({
      component: SearchbarModalComponent,
      componentProps: { componentProps },
      backdropDismiss: false,
      animated: true,
      showBackdrop: true,
      cssClass: 'searchbar-modal'
    });

    await modal.present();
    await this.alertCtrl.dismiss();
    const { data } = await modal.onWillDismiss();

    if (data) {
      this.choosenItemFromModal = data.item.name;

      if (this.accountType === 'personal') {
        this.personalForm.get('accountState').patchValue(data.item.code);
      } else {
        this.businessFrom
          .get('createdCountry')
          .patchValue(data.item.short_code);
      }
    }
  }

  public goBack() {
    this.navCtrl.back();
  }
}
