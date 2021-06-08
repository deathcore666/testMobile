import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { RequestsPage } from './requests.page';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: RequestsPage,
    children: [
      { path: '', redirectTo: 'outcome-request', pathMatch: 'full' },
      { path: 'income-request', loadChildren: './income-request/income-request.module#IncomeRequestPageModule'},
      { path: 'outcome-request', loadChildren: './outcome-request/outcome-request.module#OutcomeRequestPageModule'}
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [RequestsPage]
})
export class RequestsPageModule {}
