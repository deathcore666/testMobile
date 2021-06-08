import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../shared/shared.module';
import { ConfirmPurchasePage } from './confirm-purchase.page';

const routes: Routes = [
  {
    path: '',
    component: ConfirmPurchasePage
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
  declarations: [ConfirmPurchasePage]
})
export class ConfirmPurchasePageModule {}
