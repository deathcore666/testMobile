import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class RequestsService {

  constructor( private api: ApiService ) { }

  public findUserAccounts(identifier: string) {
    return this.api.executeRequest('GET', `/requests/ecosystem/${identifier}`);
  }

  public requestFunds(body: object) {
    return this.api.executeRequest('POST', `/requests`, body);
  }

  public getCoinRequests() {
    return this.api.executeRequest('GET', '/requests');
  }

  public getCoinRequestDetails(id: string) {
    return this.api.executeRequest('GET', `/requests/${id}`);
  }
}
