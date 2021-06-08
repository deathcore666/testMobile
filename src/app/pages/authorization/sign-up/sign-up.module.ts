import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxMaskModule, IConfig } from 'ngx-mask';

export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../shared/shared.module';

import { SignUpPage } from './sign-up.page';

const routes: Routes = [
  {
    path: '',
    component: SignUpPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    NgxMaskModule.forRoot(options),
    RouterModule.forChild(routes)
  ],
  declarations: [SignUpPage]
})
export class SignUpPageModule {}
