import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../shared/shared.module';

import { PurchasePage } from './purchase.page';
import { PurchaseListComponent } from './purchase-list/purchase-list.component';
import { PurchaseDetailsPage } from './purchase-details/purchase-details.page';

const routes: Routes = [
  {
    path: '',
    component: PurchasePage,
    children: [
      { path: '', component: PurchaseListComponent }
    ]
  }
];

@NgModule({
  entryComponents: [PurchaseDetailsPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    AngularSvgIconModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PurchasePage, PurchaseListComponent, PurchaseDetailsPage]
})
export class PurchasePageModule {}
