import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-push-notifications-modal',
  templateUrl: './push-notifications-modal.component.html',
  styleUrls: ['./push-notifications-modal.component.scss'],
})
export class PushNotificationsModalComponent implements OnInit {
  public title: string;
  public message: string;
  public action: string;

  constructor(
    private navParams: NavParams,
    private router: Router,
    private modalCtrl: ModalController,
  ) {
    this.title = this.navParams.get('title');
    this.message = this.navParams.get('message');
    this.action = this.navParams.get('action');
    console.log(this.title, this.message, this.action);
  }

  ngOnInit() {}

  public handlePushAction(action: string) {
    switch(action) {
      case 'request': {
        this.modalCtrl.dismiss();
        this.router.navigate(['requests/income-request']);
        break;
      }
      case 'transaction': {
        this.modalCtrl.dismiss();
        this.router.navigate(['transactions/incoming']);
        break;
      }
      default: {
        this.modalCtrl.dismiss();
        break;
      }
    }
  }

  public closeModal() {
    this.modalCtrl.dismiss();
  }

}
