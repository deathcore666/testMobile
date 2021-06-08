import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DepositService {
  constructor(private api: ApiService) {}

  public getDeposits() {
    return this.api.executeRequest('GET', `/deposits`);
  }

  public getDepositDetails(id: string) {
    return this.api.executeRequest('GET', `/deposits/${id}`);
  }

  public assignDeposit(token: string) {
    return this.api.executeRequest('POST', `/deposits/assign`, { token });
  }

  public getPendingDepositDetails(token: string) {
    return this.api.executeRequest('GET', `/deposits/confirm/${token}`);
  }

  public confirmDeposit(address: string, token: string) {
    return this.api.executeRequest('PATCH', `/deposits/confirm/${token}`, { address });
  }

  public cancelDeposit(token: string) {
    return this.api.executeRequest('PATCH', `/deposits/cancel/${token}`);
  }
}
