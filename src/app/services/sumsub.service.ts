import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SumsubService {
  constructor( private api: ApiService ) { }

  public getAccessToken(body: object) {
    return this.api.executeRequest('POST', `/sumsub/getAccessToken`, body);
  }
}