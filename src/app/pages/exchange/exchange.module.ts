import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../shared/shared.module';
import { ExchangePage } from './exchange.page';
import { NoAvailableExchangeComponent } from './no-available-exchange/no-available-exchange.component';
import { AngularSvgIconModule } from 'angular-svg-icon';

const routes: Routes = [
  {
    path: '',
    component: ExchangePage
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
  declarations: [
    ExchangePage,
    NoAvailableExchangeComponent,
  ],
  entryComponents: [NoAvailableExchangeComponent]
})
export class ExchangePageModule {}
