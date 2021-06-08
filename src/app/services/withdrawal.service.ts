import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class WithdrawalService {
  constructor(private api: ApiService) {}

  public getWithdrawals() {
    return this.api.executeRequest('GET', `/withdrawals`);
  }

  public getWithdrawalDetails(id: string) {
    return this.api.executeRequest('GET', `/withdrawals/${id}`);
  }

  public assignWithdrawal(token: string) {
    return this.api.executeRequest('POST', `/withdrawals/assign`, { token });
  }

  public getPendingWithdrawalDetails(token: string) {
    return this.api.executeRequest('GET', `/withdrawals/confirm/${token}`);
  }

  public confirmWithdrawal(address: string, token: string) {
    return this.api.executeRequest('PATCH', `/withdrawals/confirm/${token}`, { address });
  }

  public cancelWithdrawal(token: string) {
    return this.api.executeRequest('PATCH', `/withdrawals/cancel/${token}`);
  }
}