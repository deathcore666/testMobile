import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ExchangeService {
  constructor( private api: ApiService ) { }

  /**
   * Routes for generate exchange
   */

  public getSpreadAmount(exchangedCurrency: string, receivedCurrency: string, amount: number) {
    return this.api.executeRequest('GET', `/exchanges/spread/${exchangedCurrency}/${receivedCurrency}/${amount}`);
  }

  public createExchange(body: object) {
    return this.api.executeRequest('post', '/exchanges', body);
  }

  /**
   * Get exchange exchanges list or exchange details
   */

  public getExchanges(skip = 0, limit = 10) {
    return this.api.executeRequest('GET', `/exchanges/${limit}/${skip}`);
  }

  public getExchangeById(id: string) {
    return this.api.executeRequest('GET', `/exchanges/id/${id}`);
  }

  public getExchangeByAddress(address: string) {
    return this.api.executeRequest('GET', `/exchanges/address/${address}`);
  }
}
