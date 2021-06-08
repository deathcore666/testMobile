import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

import { NotificationsService } from '../../../services/notifications.service';
import { SettingsService } from '../../../services/settings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-face-recognition',
  templateUrl: './confirm-face-recognition.page.html',
  styleUrls: ['./confirm-face-recognition.page.scss'],
})
export class ConfirmFaceRecognitionPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  public token: string;
  public state: string;
  public error: any;

  constructor(
    private activetedRoute: ActivatedRoute,
    private storage: NativeStorage,
    private notifications: NotificationsService,
    private settingsService: SettingsService,
  ) {
    const subRoute = this.activetedRoute.paramMap.subscribe((params) => {
      this.token = params.get('token'); 
      this.error = params.get('error') === 'false' ? false : true; 
      this.state = params.get('state'); 
    });
    this.subs.push(subRoute);
  }

  ngOnInit() {
    if (!this.error) {
      this.settingsService.bioConfirmEnroll(this.token).subscribe(
        async (data: any) => {
          await this.notifications.showNotification(data.message, 'success');
          await this.storage.setItem('pinCode', false);

          await this.settingsService.clearFingerprint();
        },
        async (thrown) => {
          this.error = true;
          await this.notifications.showNotification(thrown.error.message, 'error');
        }
      );
    } else {
      this.notifications.showNotification('Error in enroll face recognition.', 'error');
    }
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }
}
