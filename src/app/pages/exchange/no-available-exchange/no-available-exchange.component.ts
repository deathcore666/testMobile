import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-no-available-exchange',
  templateUrl: './no-available-exchange.component.html',
  styleUrls: ['./no-available-exchange.component.scss'],
})
export class NoAvailableExchangeComponent implements OnInit {
  public exchangeData;

  constructor(private navParams: NavParams, private modalCtrl: ModalController ) {
    this.exchangeData = this.navParams.get('data');
  }

  ngOnInit() {}

  public currencyNameStyle(currencyName) {
    if (currencyName) {
      const _currencyName = currencyName.toLowerCase();
      return `wallet-currency-name-${_currencyName}`;
    }
  }

  public async closeModal() {
    await this.modalCtrl.dismiss();
  }

}
