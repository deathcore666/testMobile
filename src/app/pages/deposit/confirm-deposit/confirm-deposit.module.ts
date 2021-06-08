import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../shared/shared.module';

import { ConfirmDepositPage } from './confirm-deposit.page';

const routes: Routes = [
  {
    path: '',
    component: ConfirmDepositPage
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
  declarations: [ConfirmDepositPage]
})
export class ConfirmDepositPageModule {}
