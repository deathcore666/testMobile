import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../shared/shared.module';
import { WaitingLiveKycPage } from './waiting-live-kyc.page';

const routes: Routes = [
  {
    path: '',
    component: WaitingLiveKycPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [WaitingLiveKycPage]
})
export class WaitingLiveKycPageModule {}
