import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../shared/shared.module';

import { IncomingPage } from './incoming.page';
import { IncomingTransactionListComponent } from './incoming-transaction-list/incoming-transaction-list.component';
import { IncomingTransactionDetailsPage } from './incoming-transaction-details/incoming-transaction-details.page';

const routes: Routes = [
  {
    path: '',
    component: IncomingPage,
    children: [
      { path: '', component: IncomingTransactionListComponent }
    ]
  }
];

@NgModule({
  entryComponents: [IncomingTransactionDetailsPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    AngularSvgIconModule,
    RouterModule.forChild(routes)
  ],
  declarations: [IncomingPage, IncomingTransactionListComponent, IncomingTransactionDetailsPage]
})
export class IncomingPageModule {}
