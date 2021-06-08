import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';

import { NotificationsService } from '../../../services/notifications.service';
import { ProfileService } from '../../../services/profile.service';

import { Router } from '@angular/router';
import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.page.html',
  styleUrls: ['./update-profile.page.scss'],
})

export class UpdateProfilePage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public updateProfileForm: FormGroup;

  public profile: any;

  constructor(
    private router: Router,
    private notifications: NotificationsService,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private profileService: ProfileService,
    private globals: Globals,
    private translate: TranslateService,
    private formBuilder: FormBuilder
  ) {
    this.translate.setDefaultLang(this.globals.language);

    this.updateProfileForm = this.formBuilder.group({
      firstName: [null, Validators.compose([Validators.required, Validators.pattern("[a-zA-z]+([ '-][a-zA-Z]+)*")])],
      lastName: [null, Validators.compose([Validators.required, Validators.pattern("[a-zA-z]+([ '-][a-zA-Z]+)*")])],
      birthDay: [null, Validators.required]
    });
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const subGetProfile = this.profileService.getProfile().subscribe(async (res: any) => {
      this.profile = res.data;

      await loading.dismiss();
      if (this.profile.profile) {
        this.router.navigate(['/documents'], { replaceUrl: true });
      }
    },
    (thrown) => {
      this.notifications.showNotification(thrown.error.message, 'error', loading);
    });
    this.subs.push(subGetProfile);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async updateProfile() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    const form = this.updateProfileForm.value;

    const updatedProfile = {
      firstName: form.firstName,
      lastName: form.lastName,
      birthDay: form.birthDay,
    };

    const subUpdateProfile = this.profileService.updateProfile(updatedProfile).subscribe(async () => {
      await loading.dismiss();
      this.router.navigate(['/documents'], { replaceUrl: true });
    }, (thrown) => {
      this.notifications.showNotification(thrown.error.message, 'error', loading);
    });
    this.subs.push(subUpdateProfile);
  }

  public isControlStatus(controlName: string, status: string) {
    const control = this.updateProfileForm.get(controlName);
    return control.dirty && control[status];
  }

  public goBack() {
    this.navCtrl.back();
  }
}
