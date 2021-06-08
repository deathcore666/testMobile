import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { VerifyByFaceRecognitionPage } from './verify-by-face-recognition.page';

const routes: Routes = [
  {
    path: '',
    component: VerifyByFaceRecognitionPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [VerifyByFaceRecognitionPage]
})
export class VerifyByFaceRecognitionPageModule {}
