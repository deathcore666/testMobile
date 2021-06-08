import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FiatWalletsService {
  constructor( private api: ApiService ) { }

  /**
   * Generate new wallet
   */

  public generateFiatWallet(body: object) {
    return this.api.executeRequest('POST', '/fiat/wallets', body);
  }

  /**
   * Get wallets
   */

  public getFiatWallets() {
    return this.api.executeRequest('GET', `/fiat/wallets`);
  }

  public getWalletsByCurrency(currencyCode: string) {
    return this.api.executeRequest('GET', `/fiat/wallets/currency/${currencyCode}`);
  }

  public findEcosystemAccounts(identifier: string, currencyCode: string) {
    return this.api.executeRequest('GET', `/fiat/wallets/ecosystem/${identifier}/${currencyCode}`);
  }

  /**
   * Get wallet details
   */

  public getFiatWalletDetails(currencyCode: string, address: string) {
    return this.api.executeRequest('GET', `/fiat/address/${currencyCode}/${address}`);
  }

  /**
   * Update wallets
   */

  public changeFiatWalletName(currencyCode: string, address: string, name: string) {
    return this.api.executeRequest('PATCH', `/fiat/wallets/${currencyCode}/${address}`, { name });
  }

  public buyFiatWithCard(body: Object) {
    return this.api.executeRequest('POST', '/fiat/cc', body);
  }
}
