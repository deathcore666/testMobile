import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { IonicModule } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { FiatWalletsDetailsPage } from './fiat-wallet-details.page';
import { SharedModule } from '../../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: FiatWalletsDetailsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AngularSvgIconModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FiatWalletsDetailsPage],
  providers: [InAppBrowser]
})
export class IbanDetailsPageModule {}
