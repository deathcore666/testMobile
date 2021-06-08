import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../shared/shared.module';

import { DepositPage } from './deposit.page';
import { DepositListComponent } from './deposit-list/deposit-list.component';
import { DepositDetailsPage } from './deposit-details/deposit-details.page';

const routes: Routes = [
  {
    path: '',
    component: DepositPage,
    children:[
      { path: '', component: DepositListComponent }
    ]
  }
];

@NgModule({
  entryComponents: [DepositDetailsPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    AngularSvgIconModule,
    RouterModule.forChild(routes)
  ],
  declarations: [DepositPage, DepositListComponent, DepositDetailsPage]
})
export class DepositPageModule {}
