import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../shared/shared.module';

import { IncomeRequestPage } from './income-request.page';
import { IncomeRequestListComponent } from './income-request-list/income-request-list.component';
import { IncomeRequestDetailsPage } from './income-request-details/income-request-details.page';

const routes: Routes = [
  {
    path: '',
    component: IncomeRequestPage,
    children: [
      { path: '', component: IncomeRequestListComponent }
    ]
  }
];

@NgModule({
  entryComponents: [IncomeRequestDetailsPage],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    IonicModule,
    AngularSvgIconModule,
    RouterModule.forChild(routes)
  ],
  declarations: [IncomeRequestPage, IncomeRequestListComponent, IncomeRequestDetailsPage]
})
export class IncomeRequestPageModule {}
