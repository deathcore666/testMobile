import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../../shared/shared.module';
import { SwiftTransactionPage } from './swift-transaction.page';

const routes: Routes = [
  {
    path: '',
    component: SwiftTransactionPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SwiftTransactionPage]
})
export class SwiftTransactionPageModule {}
