import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ConfirmFaceRecognitionPage } from './confirm-face-recognition.page';

const routes: Routes = [
  {
    path: '',
    component: ConfirmFaceRecognitionPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ConfirmFaceRecognitionPage]
})
export class ConfirmFaceRecognitionPageModule {}
