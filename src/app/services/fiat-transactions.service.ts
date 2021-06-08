import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FiatTransactionsService {
  constructor( private api: ApiService ) { }

  /**
   * Create new transactions
   */

  public createSepaTransaction(body: object) {
    return this.api.executeRequest('POST', '/fiat/transactions/sepa', body);
  }

  public createSwiftTransaction(body: object) {
    return this.api.executeRequest('POST', '/fiat/transactions/swift', body);
  }

  public createEcosystemTransaction(body: object) {
    return this.api.executeRequest('POST', `/fiat/transactions/ecosystem`, body);
  }

  public createAchTransaction(accountType: string, body: object) {
    return this.api.executeRequest('POST', `/fiat/transactions/${accountType}/ach`, body);
  }

  public createChapsTransaction(body: object) {
    return this.api.executeRequest('POST', `/fiat/transactions/chaps`, body);
  }

  public createMaxFiatTransactions(body: Object) {
    return this.api.executeRequest('POST', '/fiat/transactions/max', body);
  }

  /**
   * Get transactions
   */

  public getOutgoingFiatTransactions() {
    return this.api.executeRequest('GET', `/fiat/transactions/outgoing`);
  }

  public getIncomingFiatTransactions() {
    return this.api.executeRequest('GET', `/fiat/transactions/incoming`);
  }


  /**
   * Create transaction details
   */

  public getIncomingFiatTransactionsDetails(id: string) {
    return this.api.executeRequest('GET', `/fiat/transactions/incoming/details/${id}`);
  }

  public getOutgoingFiatTransactionsDetails(id: string) {
    return this.api.executeRequest('GET', `/fiat/transactions/outgoing/details/${id}`);
  }

  public getFiatTransactionsRequisites(type: string) {
    return this.api.executeRequest('GET', `/fiat/transactions/requisites/${type}`);
  }
}
