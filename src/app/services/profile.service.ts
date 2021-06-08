import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor( private api: ApiService ) { }

  public getProfile() {
    return this.api.executeRequest('GET', `/profile`);
  }

  public updateProfile(body) {
    return this.api.executeRequest('POST', '/profile', body);
  }

  public sendDocuments(body: FormData) {
    return this.api.executeRequest('POST', '/profile/documents', body);
  }

  public sendSelfie(body: FormData) {
    return this.api.executeRequest('POST', '/profile/selfie', body);
  }

  public skipKYC() {
    return this.api.executeRequest('PATCH', '/profile/kyc/skip');
  }
}
