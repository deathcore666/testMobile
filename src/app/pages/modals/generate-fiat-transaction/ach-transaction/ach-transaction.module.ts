import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../../shared/shared.module';

import { AchTransactionPage } from './ach-transaction.page';

const routes: Routes = [
  {
    path: '',
    component: AchTransactionPage
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
  declarations: [AchTransactionPage]
})
export class AchTransactionPageModule {}
