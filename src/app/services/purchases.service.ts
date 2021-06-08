import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {
  constructor( private api: ApiService ) { }

  /**
   * Assign to orphan purchase (by qr-code/nfc) and confirm/cancel it
   */

  public assignPurchase( token: string ) {
    return this.api.executeRequest( 'POST', `/purchases/orphan/assign`, { token } );
  }

  public confirmOrphanPurchase( address: string, token: string ) {
    return this.api.executeRequest( 'PATCH', `/purchases/orphan/confirm/${token}`, { address } );
  }

  public cancelOrphanPurchase( token: string ) {
    return this.api.executeRequest( 'PATCH', `/purchases/orphan/cancel/${token}`);
  }

  /**
   * Get purchases list and details
   */

  public getPurchases(skip = 0, limit = 10) {
    return this.api.executeRequest( 'GET', `/purchases/${limit}/${skip}`);
  }

  public getPurchasesByAddress(address: string) {
    return this.api.executeRequest( 'GET', `/purchases/details/${address}`);
  }

  public getPurchaseDetails( id: string ) {
    return this.api.executeRequest( 'GET', `/purchases/${id}`);
  }

  public getOrphanPurchaseDetails( token: string ) {
    return this.api.executeRequest( 'GET', `/purchases/orphan/confirm/${token}`);
  }
}
