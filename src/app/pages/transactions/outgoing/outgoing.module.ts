import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../shared/shared.module';

import { OutgoingPage } from './outgoing.page';
import { OutgoingTransactionListComponent } from './outgoing-transaction-list/outgoing-transaction-list.component';
import { OutgoingTransactionDetailsPage } from './outgoing-transaction-details/outgoing-transaction-details.page';

const routes: Routes = [
  {
    path: '',
    component: OutgoingPage,
    children: [
      { path: '', component: OutgoingTransactionListComponent }
    ]
  }
];

@NgModule({
  entryComponents: [OutgoingTransactionDetailsPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    AngularSvgIconModule,
    RouterModule.forChild(routes)
  ],
  declarations: [OutgoingPage, OutgoingTransactionListComponent, OutgoingTransactionDetailsPage],
  providers: [InAppBrowser]
})
export class OutgoingPageModule {}
