import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TabsComponent } from './tabs/tabs.component';
import { RouterModule } from '@angular/router';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

import { NotFoundComponent } from './not-found/not-found.component';
import { FiatMaximalModalComponent } from '../pages/modals/generate-fiat-transaction/fiat-maximal-modal/fiat-maximal-modal.component';
import { PushNotificationsModalComponent } from './push-notifications-modal/push-notifications-modal.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  exports: [
    NotFoundComponent,
    TabsComponent,
    TranslateModule
  ],
  declarations: [
    NotFoundComponent,
    TabsComponent,
    FiatMaximalModalComponent,
    PushNotificationsModalComponent
  ],
  entryComponents: [FiatMaximalModalComponent, PushNotificationsModalComponent]
})
export class SharedModule { }
