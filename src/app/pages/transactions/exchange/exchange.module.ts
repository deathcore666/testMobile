import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../shared/shared.module';

import { ExchangePage } from './exchange.page';
import { ExchangeListComponent } from './exchange-list/exchange-list.component';
import { ExchangeDetailsPage } from './exchange-details/exchange-details.page';

const routes: Routes = [
  {
    path: '',
    component: ExchangePage,
    children: [
      { path: '', component: ExchangeListComponent }
    ]
  }
];

@NgModule({
  entryComponents: [ExchangeDetailsPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    AngularSvgIconModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ExchangePage, ExchangeListComponent, ExchangeDetailsPage]
})
export class ExchangePageModule {}
