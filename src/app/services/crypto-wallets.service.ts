import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})

export class CryptoWalletsService {
  constructor( private api: ApiService ) { }

  /**
   * Generate new wallet
   */

  public generateCryptoWallet(body: object) {
    return this.api.executeRequest('POST', `/crypto/wallets`, body);
  }

  /**
   * Get wallets
   */

  public getCryptoWallets() {
    return this.api.executeRequest('GET', `/crypto/wallets`);
  }

  public getWalletsByCurrency(currencyCode: string) {
    return this.api.executeRequest('GET', `/crypto/wallets/currency/${currencyCode}`);
  }

  /**
   * Get wallet details
   */

  public getCryptoWalletDetails(address: string) {
    return this.api.executeRequest('GET', `/crypto/address/${address}`);
  }

  /**
   * Update wallets
   */

  public changeCryptoWalletName(currencyCode: string, address: string, name: string) {
    return this.api.executeRequest('PATCH', `/crypto/wallets/${currencyCode}/${address}`, { name });
  }
}
