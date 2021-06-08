import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavController, LoadingController, Platform, AlertController } from "@ionic/angular";

import { RequestsService } from "../../../services/requests.service";
import { NotificationsService } from "../../../services/notifications.service";
import { Globals } from "../../../services/globals.service";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from 'rxjs';

@Component({
  selector: "app-request-coins",
  templateUrl: "./request-coins.page.html",
  styleUrls: ["./request-coins.page.scss"]
})
export class RequestCoinsPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private address: string;
  private requestEmail: string;
  private emailPattern = new RegExp("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[.]+[a-zA-Z.]{2,64}");

  public step = 1;
  public currencyCode: string;

  public identifier: string;
  public amount: number;
  public notes: string;

  public userAccounts;
  public choosenEcosystem: string;
  public recepientName: string;

  constructor(
    private navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private requestsService: RequestsService,
    private notifications: NotificationsService,
    private loadingCtrl: LoadingController,
    private globals: Globals,
    private translate: TranslateService,
    private platform: Platform,
    private alertCtrl: AlertController
  ) {
    this.translate.setDefaultLang(this.globals.language);

    const subRoute = this.activatedRoute.paramMap.subscribe(params => {
      this.address = params.get("address");
      this.currencyCode = params.get("currency");
    });
    this.subs.push(subRoute);
  }

  ngOnInit() {
    const backSub = this.platform.backButton.subscribe(async () => {
      try {
        const alert = await this.alertCtrl.getTop();
        if (alert) {
          alert.dismiss();
          return;
        } else if (this.step === 1) {
          this.navCtrl.back();
        } else {
          return this.step = 1;
        }
    } catch (error) {}
    });
    this.subs.push(backSub);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
  }

  public async findUserAccounts() {
    const loading = await this.loadingCtrl.create({ spinner: "crescent" });
    await loading.present();

    const subFindUser = this.requestsService
      .findUserAccounts(this.identifier.toLowerCase())
      .subscribe(
        async (data: any) => {
          if (data.data.length === 0) {
            this.choosenEcosystem = "";
            if (this.emailPattern.test(this.identifier.toLowerCase())) {
              await loading.dismiss();
              this.requestEmail = this.identifier.toLowerCase();
              this.requestCoins();
            } else {
              return this.notifications.showNotification('invalidIdetifier', 'error', loading);
            }
          }

          if (data.data.length === 1) {
            this.requestEmail = data.data[0].email;
            this.choosenEcosystem = data.data[0].ecosystem;
            await loading.dismiss();
            this.requestCoins();
          }

          if (data.data.length > 1) {
            await loading.dismiss();
            this.userAccounts = data.data;
            this.step = 2;
          }
        },
        thrown => {
          this.notifications.showNotification(
            thrown.error.message,
            "error",
            loading
          );
        }
      );
    this.subs.push(subFindUser);
  }

  public getRecepientData(event) {
    const result = this.userAccounts.find(ecosystem => {
      return event === ecosystem.ecosystem;
    });
    this.recepientName = result.recipient;
  }

  public sendWithEcosystem() {
    const result = this.userAccounts.find(ecosystem => {
      return this.choosenEcosystem === ecosystem.ecosystem;
    });
    this.requestEmail = result.email;
    this.requestCoins();
  }

  public async requestCoins() {
    const loading = await this.loadingCtrl.create({ spinner: "crescent" });
    await loading.present();

    const requestBody = {
      email: this.requestEmail,
      toAddress: this.address,
      amount: this.amount,
      currencyCode: this.currencyCode,
      ecosystem: this.choosenEcosystem,
      ...(this.notes && { notes: this.notes })
    };

    const subRequestFunds = this.requestsService.requestFunds(requestBody).subscribe(
      (data: any) => {
        this.notifications.showNotification(
          data.message,
          "success",
          loading
        );
        this.navCtrl.back();
      },
      (thrown: any) => {
        this.notifications.showNotification(
          thrown.error.message,
          "error",
          loading
        );
      }
    );
    this.subs.push(subRequestFunds);
  }

  public previousStep() {
    this.step = 1;
  }

  public openSelect() {
    setTimeout(() => {
      const optionsButton = document.getElementsByClassName("alert-radio-icon");
      for (let i = 0; i < this.userAccounts.length; i++) {
        optionsButton.item(i).classList.add(this.userAccounts[i].ecosystem);
      }
    }, 200);
  }

  public goBack() {
    this.navCtrl.back();
  }
}
