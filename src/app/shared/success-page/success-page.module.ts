import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SuccessPageComponent } from './success-page.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared.module';

const routes: Routes = [
  {
    path: '',
    component: SuccessPageComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SuccessPageComponent]
})
export class SuccessPageModule { }
