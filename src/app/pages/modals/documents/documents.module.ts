import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../shared/shared.module';
import { DocumentsPage } from './documents.page';

const routes: Routes = [
  {
    path: '',
    component: DocumentsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [DocumentsPage]
})
export class DocumentsPageModule {}
