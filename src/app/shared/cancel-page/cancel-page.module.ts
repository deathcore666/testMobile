import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CancelPageComponent } from './cancel-page.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared.module';

const routes: Routes = [
  {
    path: '',
    component: CancelPageComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [CancelPageComponent]
})
export class CancelPageModule { }
