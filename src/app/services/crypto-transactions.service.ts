import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CryptoTransactionsService {
  constructor( private api: ApiService ) { }

  /**
   * Create new transactions
   */

  public createCryptoTransactions(body: object) {
    return this.api.executeRequest('POST', `/crypto/transactions`, body);
  }

  public createMaxCryptoTransactions(body: Object) {
    return this.api.executeRequest('POST', '/crypto/transactions/max', body);
  }

  /**
   * Get transactions
   */

  public getOutgoingCryptoTransactions() {
    return this.api.executeRequest('GET', `/crypto/transactions/outgoing`);
  }

  public getIncomingCryptoTransactions() {
    return this.api.executeRequest('GET', `/crypto/transactions/incoming`);
  }

  public getOutgoingTransactionsByAddress(address: string): any {
    return this.api.executeRequest('GET', `/crypto/transactions/outgoing/address/${address}`);
  }

  public getIncomingTransactionsByAddress(address: string):any {
    return this.api.executeRequest('GET', `/crypto/transactions/incoming/address/${address}`);
  }

  /**
   * GET transaction details
   */

  public getIncomingCryptoTransactionDetails(id: string) {
    return this.api.executeRequest('GET', `/crypto/transactions/incoming/details/${id}`);
  }

  public getOutgoingCryptoTransactionDetails(id: string) {
    return this.api.executeRequest('GET', `/crypto/transactions/outgoing/details/${id}`);
  }
}
