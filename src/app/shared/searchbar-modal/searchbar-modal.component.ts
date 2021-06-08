import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-searchbar-modal',
  templateUrl: './searchbar-modal.component.html',
  styleUrls: ['./searchbar-modal.component.scss']
})

export class SearchbarModalComponent implements OnInit {
  public componentProps;
  public currency: boolean;
  public filteredArray = [];
  public title: string;
  
  private item: any;
  private array = [];
  public availableCurrencies: any;

  constructor(
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController
  ) {}
  
  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
    await loading.present();

    this.title = this.componentProps.title;
    this.item = this.componentProps.item;
    this.array = this.componentProps.array;

    if (this.componentProps.from !== 'documents') {
      this.currency = true;
    }

    if (this.componentProps.from === 'exchangeFrom') {
      this.availableCurrencies = this.componentProps.availableCurr.map((item) => {
        return {
          selected: false,
          name: item.currencyName,
          code: item.currencyCode,
          type: item.currencyType
        };
      });
    } else {
      this.availableCurrencies = this.componentProps.availableCurr;
    }

    this.componentProps.array.forEach(item => {
      item.selected = false;
    });

    this.filteredArray = this.componentProps.array;
    await loading.dismiss();
  }

  public filterArray(event) {
    let searchValue = event.target.value.toLowerCase();
    if (event.target.value) {
      this.availableCurrencies = this.array.filter((item: any) => {
        if (item.name.toLowerCase().includes(searchValue) || item.code.toLowerCase().includes(searchValue) ) {
          return item;
        }
      });
    } else {
      this.availableCurrencies = this.array;
    }
  }

  public async closeModal() {
    await this.modalCtrl.dismiss();
  }

  public chooseItem(choosenItem, array) {
    this.item = choosenItem;
  
    for (let item of array) {
      if (item === choosenItem) {
        item.selected = !item.selected;
        
        if (item.selected) {
          this.choose();
        }
      } else {
        item.selected = false;
      }
    }
  }

  private async choose() {
    if (this.componentProps.from === 'exchangeFrom') {
      await this.modalCtrl.dismiss({ exchangedCurrency: this.item, from: this.componentProps.from });
    } else if (this.componentProps.from === 'exchangeTo') {
      await this.modalCtrl.dismiss({ receivedCurrency: this.item, from: this.componentProps.from });
    } else {
      await this.modalCtrl.dismiss({ item: this.item });    
    }
  }
}
