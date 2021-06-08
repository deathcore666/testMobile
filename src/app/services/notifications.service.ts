import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  constructor(
    private toastCtrl: ToastController,
    private translate: TranslateService,
    private storage: NativeStorage,
  ) { }

  public async showNotification(message: string, messageStatus: string, loading?, time?: number, position?) {
    let language: string;

    try {
      language = await this.storage.getItem('language');
      this.translate.setDefaultLang(language);
    } catch {
      language = 'en';
    }

    this.translate.getTranslation(language).subscribe(
      async (messages) => {
        if (!message.includes('lang_')) {
          const localTranslatedMessage = messages.localMessages[message];

          const localToast = await this.toastCtrl.create({
            message: localTranslatedMessage,
            duration: time ? time : 2000,
            cssClass: `toast-message-${messageStatus}`,
            position: position ? position : 'bottom'
          });

          if (!localTranslatedMessage) {
            localToast.message = message;
          }

          if (loading) {
            await loading.dismiss();
            loading = null;
          }

          await localToast.present();
          return;
        }

        const translatedMessage = messages.apiResponses[message];

        const toast = await this.toastCtrl.create({
          message: translatedMessage,
          duration: time ? time : 2000,
          cssClass: `toast-message-${messageStatus}`,
          position: position ? position : 'bottom'
        });

        if (loading) {
          await loading.dismiss();
          loading = null;
        }

        await toast.present();
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
