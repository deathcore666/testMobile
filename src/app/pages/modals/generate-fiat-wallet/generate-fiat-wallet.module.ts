import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../shared/shared.module';
import { GenerateFiatWalletPage } from './generate-fiat-wallet.page';

const routes: Routes = [
  {
    path: '',
    component: GenerateFiatWalletPage
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
  declarations: [GenerateFiatWalletPage]
})
export class GenerateFiatWalletPageModule {}
