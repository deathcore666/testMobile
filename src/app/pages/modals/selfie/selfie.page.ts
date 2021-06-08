import { Component, OnInit } from '@angular/core';
import { NavController, ActionSheetController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../../services/globals.service';
import { FileUploaderService } from '../../../services/file-upload.service';
import { NotificationsService } from '../../../services/notifications.service';
import { ProfileService } from './../../../services/profile.service';

@Component({
  selector: 'app-selfie',
  templateUrl: './selfie.page.html',
  styleUrls: ['./selfie.page.scss'],
})
export class SelfiePage implements OnInit {
  private translatedMessages;
  public savedUploadedFiles = [];
  public showLoading: boolean;

  constructor(
    public readonly navCtrl: NavController,
    public readonly translate: TranslateService,
    private readonly router: Router,
    private readonly actionSheetController: ActionSheetController,
    private readonly loadingCtrl: LoadingController,
    private readonly globals: Globals,
    private readonly fileUploaderService: FileUploaderService,
    private readonly notifications: NotificationsService,
    private readonly profileService: ProfileService
  ) {
    this.translate.getTranslation(this.globals.language).subscribe((messages: any) => {
      this.translatedMessages = messages;
    });
  }

  ngOnInit() { }

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
        text: `${this.translatedMessages.documents.takePhoto}/${this.translatedMessages.documents.takeSelfie}`,
        icon: 'camera',
        handler: () => {
          this.takePhoto();
        }
      }, {
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

  public skipSelfie() {
    this.profileService.skipKYC().subscribe(() => this.navCtrl.back());
  }

  public async sendSelfie() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const formData = new FormData();

    this.savedUploadedFiles.forEach(file => formData.append('file', file, file.name));

    this.profileService.sendSelfie(formData).subscribe(async () => {
      this.router.navigate(['/waiting-live-kyc'], { replaceUrl: true });
      await loading.dismiss();
    }, (thrown) => {
      this.notifications.showNotification(thrown.error.message, 'error', loading);
    });
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

  private appendFiles() {
    let uploadedFiles = [];
    uploadedFiles = this.fileUploaderService.getFiles();
    const element = document.getElementById('custom-click');

    if (uploadedFiles) {
      uploadedFiles.forEach((uploadFile) => {
        if (this.savedUploadedFiles.length < 1) {
          this.savedUploadedFiles.push(uploadFile);
          this.showLoading = false;
          return element.click();
        } else {
          this.showLoading = false;
          const message = 'selfieUploadFilesError';
          this.notifications.showNotification(message, 'error');
        }
      });
    }
  }
}
