import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActionSheetController, LoadingController, ModalController, AlertController, NavController, Platform } from '@ionic/angular';
import { InfoService } from '../../../services/info.service';
import { NotificationsService } from '../../../services/notifications.service';
import { FileUploaderService } from '../../../services/file-upload.service';
import { ProfileService } from '../../../services/profile.service';
import { Router } from '@angular/router';
import { SearchbarModalComponent } from '../../../shared/searchbar-modal/searchbar-modal.component';
import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.page.html',
  styleUrls: ['./documents.page.scss'],
})

export class DocumentsPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content: IonContent;

  public customAlertOptions: any = {
    header: 'KYC',
  };
  private subs: Subscription[] = [];
  public documentForm: FormGroup;
  private countryList: any[];
  private profile: any;
  private translatedMessages: any;
  public itemFromModal: string;
  public itemShowState: boolean;

  public documentTypeList: any[];
  public savedUploadedFiles = [];
  public showLoading: boolean;
  public itemFromStateModal: string;
  public stateList: {};

  public uploadingStep = 1;

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private notifications: NotificationsService,
    private loadingCtrl: LoadingController,
    private infoService: InfoService,
    private alertCtrl: AlertController,
    private fileUploaderService: FileUploaderService,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private navCtrl: NavController,
    private globals: Globals,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private platform: Platform
  ) {
    const subTranslation = this.translate.getTranslation(this.globals.language).subscribe((messages: any) => {
      this.translatedMessages = messages;

      this.documentTypeList = [
        { name: this.translatedMessages.documents.documentTypeList.passport,
          value: 'passport'
        },
        { name: this.translatedMessages.documents.documentTypeList.driverLicense, 
          value: 'drivers_license' 
        },
        { name: this.translatedMessages.documents.documentTypeList.socialSecurityNumber, 
          value: 'social_security_number' 
        },
        { name: this.translatedMessages.documents.documentTypeList.greenCard, 
          value: 'green_card' 
        },
        { name: this.translatedMessages.documents.documentTypeList.visa, 
          value: 'visa' 
        },
        { name: this.translatedMessages.documents.documentTypeList.matriculaConsular, 
          value: 'matricula_consular' 
        },
        { name: this.translatedMessages.documents.documentTypeList.registroFederalDeContribuyentes, 
          value: 'registro_federal_de_contribuyentes' 
        },
        { name: this.translatedMessages.documents.documentTypeList.credentialDeElector, 
          value: 'credential_de_elector' 
        },
        { name: this.translatedMessages.documents.documentTypeList.socialInsuranceNumber, 
          value: 'social_insurance_number' 
        },
        { name: this.translatedMessages.documents.documentTypeList.citizenshipPapers, 
          value: 'citizenship_papers' 
        },
        { name: this.translatedMessages.documents.documentTypeList.driversLicenseCanadian, 
          value: 'drivers_license_canadian' 
        },
        { name: this.translatedMessages.documents.documentTypeList.existingCreditCardDetails, 
          value: 'existing_credit_card_details' 
        },
        { name: this.translatedMessages.documents.documentTypeList.employerIdentificationNumber, 
          value: 'employer_identification_number' 
        },
        { name: this.translatedMessages.documents.documentTypeList.nationalId, 
          value: 'national_id' 
        },
        { name: this.translatedMessages.documents.documentTypeList.others, 
          value: 'others' 
        },
        { name: this.translatedMessages.documents.documentTypeList.incorporationNumber, 
          value: 'incorporation_number' 
        }
      ];
    });
    this.subs.push(subTranslation);

    this.translate.setDefaultLang(this.globals.language);

    this.documentForm = this.formBuilder.group({
      firstStep: this.formBuilder.group({
        documentType: [null, Validators.required],
        country: [null, Validators.required],
      })
    });
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();
    await this.getCountries();

    const subGetProfile = this.profileService.getProfile().subscribe(
      async (res: any) => {
        this.profile = res.data;
        await loading.dismiss();
        if (this.profile.documents) {
          this.router.navigate(['/generate-fiat-wallet'], { replaceUrl: true });
        }
      },
      (thrown: any) => {
        this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    );
    this.subs.push(subGetProfile);

    const backSub = this.platform.backButton.subscribe(async () => {
      try {
        const modal = await this.modalController.getTop();
        const alert = await this.alertCtrl.getTop();
        const actionSheet = await this.actionSheetController.getTop();
        if (modal || alert) {
          modal.dismiss();
          alert.dismiss();
          return;
        } else if (actionSheet) {
          actionSheet.dismiss();
          return;
        } else if (this.uploadingStep === 1) {
          this.navCtrl.back();
        } else {
          return this.uploadingStep = 1;
        }
    } catch (error) {}
    });
    this.subs.push(backSub);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async openCountriesModal() {
    const componentProps = {
      array: this.countryList,
      item: null,
      title: 'Countries',
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
      this.itemFromModal = data.item.name;
      this.itemShowState = data.item.showProvince;
      this.documentForm.get('firstStep').get('country').patchValue(data.item.alpha3);
    }
  }

  public async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: this.translatedMessages.documents.modalHeader,
      buttons: [{
        text: this.translatedMessages.documents.fromLibrary,
        role: 'library',
        icon: 'folder',
        handler: () => {
          this.choseFile();
        }
      }, {
        text: this.translatedMessages.documents.takePhoto,
        icon: 'camera',
        handler: () => {
          this.takePhoto();
        }
      }, {
        text: this.translatedMessages.documents.takeSelfie,
        icon: 'aperture',
        handler: () => {
          this.takePhoto();
        }
      },{
        text: this.translatedMessages.common.cancel,
        icon: 'close',
        role: 'cancel',
        handler: async () => {
          await actionSheet.dismiss();
        }
      }]
    });

    await actionSheet.present();
  }

  public async sentDocuments() {
    const firstStep = this.documentForm.get('firstStep').value;
    const body = Object.assign(firstStep);
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    const formData = new FormData();

    formData.append('documentType', body.documentType);
    formData.append('country', body.country);
    
    this.savedUploadedFiles.forEach((file: any, index) => {
      formData.append(`file${index}`, file, file.name);
    });

    await loading.present();
    const subSendDoc = this.profileService.sendDocuments(formData).subscribe(async (res: any) => {
      await loading.dismiss();
      this.router.navigate(['/selfie'], { replaceUrl: true });
      this.notifications.showNotification(res.message, 'success', loading);
    }, async (thrown) => {
      if (thrown.status === 0) {
        await this.notifications.showNotification('fileSizeWrong', 'error', loading);
      } else {
        await this.notifications.showNotification(thrown.error.message, 'error', loading);
      }
    });
    this.subs.push(subSendDoc);
  }

  public removeUploadedFile(file, array) {
    this.savedUploadedFiles = array.filter((value) => {
      return value !== file;
    });

    this.fileUploaderService.setFiles(this.savedUploadedFiles);
  }

  private async choseFile() {
    this.showLoading = true;
    this.fileUploaderService.uploadFromImagePicker().then((files) => {
      if (!files) {
        this.showLoading = false;
      }
      this.appendFiles();
    });
  }

  private takePhoto() {
    this.showLoading = true;
    this.fileUploaderService.takePhoto().then((files) => {
      if (!files) {
        this.showLoading = false;
      }
      this.appendFiles();
    });
  }

  private async getCountries() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subGetCountry = this.infoService.getCountries().subscribe(async (res: any) => {
      await loading.dismiss();
      this.countryList = res.data;
    }, (thrown) => {
      this.notifications.showNotification(thrown.error.message, 'error', loading);
    });
    this.subs.push(subGetCountry);
  }

  private appendFiles() {
    let uploadedFiles = [];
    uploadedFiles = this.fileUploaderService.getFiles();
    const element = document.getElementById('custom-click');

    if (uploadedFiles) {
      uploadedFiles.forEach((uploadFile) => {
        if (this.savedUploadedFiles.length < 4) {
          this.savedUploadedFiles.push(uploadFile);
          this.showLoading = false;
          return element.click();
        } else {
          this.showLoading = false;
          const message = 'uploadFilesError';
          this.notifications.showNotification(message, 'error');
        }
      });
    }
  }

  public isControlStatus(formGroupName: string, controlName: string, status: string) {
    const control = this.documentForm.get(formGroupName).get(controlName);
    return control.dirty && control[status];
  }

  public goBack() {
    this.navCtrl.back();
  }
}
