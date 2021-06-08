import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class InfoService {
  constructor( private api: ApiService ) { }

  public getQrCode(address: string, currency: string) {
    return this.api.executeRequest('GET', `/info/qrcode/${currency}/${address}`);
  }

  public getCountries() {
    return this.api.executeRequest('GET', '/info/countries');
  }
}
