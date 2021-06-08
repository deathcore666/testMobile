import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { IonicModule } from '@ionic/angular';
import { TransactionsPage } from './transactions.page';
import { SharedModule } from '../../shared/shared.module';
import { TransactionHeaderService } from './transactions-header.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

const routes: Routes = [
  {
    path: '',
    component: TransactionsPage,
    children: [
      { path: '', redirectTo: 'outgoing', pathMatch: 'full'},
      { path: 'outgoing', loadChildren: './outgoing/outgoing.module#OutgoingPageModule' },
      { path: 'exchange', loadChildren: './exchange/exchange.module#ExchangePageModule' },
      { path: 'incoming', loadChildren: './incoming/incoming.module#IncomingPageModule' },
      { path: 'purchase', loadChildren: './purchase/purchase.module#PurchasePageModule' },
      { path: 'deposit', loadChildren: './deposit/deposit.module#DepositPageModule' },
      { path: 'withdrawal', loadChildren: './withdrawal/withdrawal.module#WithdrawalPageModule' }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    AngularSvgIconModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TransactionsPage],
  providers: [TransactionHeaderService, InAppBrowser]
})
export class TransactionsPageModule {}
