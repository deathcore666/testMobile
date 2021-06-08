import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  constructor( private api: ApiService ) {}

  public getCurrencies() {
    return this.api.executeRequest( 'GET', `/currencies`);
  }

  public getCryptoCurrencies() {
    return this.api.executeRequest( 'GET', `/currencies/crypto`);
  }

  public getFiatCurrencies() {
    return this.api.executeRequest('GET', '/currencies/fiat');
  }

  public getCurrencyPaymentMethods(code: string) {
    return this.api.executeRequest('GET', `/currencies/payment-methods/${code}`);
  }
}
