import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../shared/shared.module';
import { CryptoWalletDetailsPage } from './crypto-wallet-details.page';
import { TransactionsByAddressComponent } from './transactions-by-address/transactions-by-address.component';
import { AngularSvgIconModule } from 'angular-svg-icon';

const routes: Routes = [
  {
    path: '',
    component: CryptoWalletDetailsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    AngularSvgIconModule,
    RouterModule.forChild(routes)
  ],
  declarations: [CryptoWalletDetailsPage, TransactionsByAddressComponent],
  entryComponents: [TransactionsByAddressComponent],
})
export class WalletDetailsPageModule {}
