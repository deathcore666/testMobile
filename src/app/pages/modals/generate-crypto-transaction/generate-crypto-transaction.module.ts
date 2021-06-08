import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../shared/shared.module';
import { GenerateCryptoTransactionPage } from './generate-crypto-transaction.page';
import { CryptoMaximalModalComponent } from './crypto-maximal-modal/crypto-maximal-modal.component';

const routes: Routes = [
  {
    path: '',
    component: GenerateCryptoTransactionPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [GenerateCryptoTransactionPage, CryptoMaximalModalComponent],
  entryComponents: [CryptoMaximalModalComponent]
})
export class SendCoinsPageModule {}
