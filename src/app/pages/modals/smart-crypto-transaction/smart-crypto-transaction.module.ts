import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../shared/shared.module';
import { SmartCryptoTransactionPage } from './smart-crypto-transaction.page';

const routes: Routes = [
  {
    path: '',
    component: SmartCryptoTransactionPage
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
  declarations: [SmartCryptoTransactionPage]
})
export class SmartSendCoinsPageModule {}
