import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../shared/shared.module';

import { OutcomeRequestPage } from './outcome-request.page';
import { OutcomeRequestListComponent } from './outcome-request-list/outcome-request-list.component';
import { OutcomeRequestDetailsPage } from './outcome-request-details/outcome-request-details.page';

const routes: Routes = [
  {
    path: '',
    component: OutcomeRequestPage,
    children: [
      { path: '', component: OutcomeRequestListComponent }
    ]
  }
];

@NgModule({
  entryComponents: [OutcomeRequestDetailsPage],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    IonicModule,
    AngularSvgIconModule,
    RouterModule.forChild(routes)
  ],
  declarations: [OutcomeRequestPage, OutcomeRequestListComponent, OutcomeRequestDetailsPage]
})
export class OutcomeRequestPageModule {}
