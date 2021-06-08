import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../shared/shared.module';

import { WithdrawalPage } from './withdrawal.page';
import { WithdrawalListComponent } from './withdrawal-list/withdrawal-list.component';
import { WithdrawalDetailsPage } from './withdrawal-details/withdrawal-details.page';

const routes: Routes = [
  {
    path: '',
    component: WithdrawalPage,
    children: [
      { path: '', component: WithdrawalListComponent }
    ]
  }
];

@NgModule({
  entryComponents: [WithdrawalDetailsPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    AngularSvgIconModule,
    RouterModule.forChild(routes)
  ],
  declarations: [WithdrawalPage, WithdrawalListComponent, WithdrawalDetailsPage]
})
export class WithdrawalPageModule {}
