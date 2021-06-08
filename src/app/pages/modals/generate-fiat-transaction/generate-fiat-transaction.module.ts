import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../shared/shared.module';
import { GenerateFiatTransactionPage } from './generate-fiat-transaction.page';
import { FiatMaximalModalComponent } from './fiat-maximal-modal/fiat-maximal-modal.component';

const routes: Routes = [
  {
    path: '',
    component: GenerateFiatTransactionPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AngularSvgIconModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [GenerateFiatTransactionPage]
})
export class SendFiatCoinsPageModule {}
