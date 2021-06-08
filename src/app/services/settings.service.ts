import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  constructor( private api: ApiService ) { }

  /**
   * Get all user settings
   */

  public getUserSettings() {
    return this.api.executeRequest('GET', `/settings`);
  }

  /**
   * Change user settings
   */

  public changeNotificationStatus(type: string) {
    return this.api.executeRequest('PATCH', `/settings/notification/${type}`, {});
  }

  public changePassword(body: object) {
    return this.api.executeRequest('PATCH', '/settings/password', body);
  }

  public changeTypeOfVerification(type: string, body: object) {
    return this.api.executeRequest('PATCH', `/settings/verification/${type}`, body);
  }

  /**
   * Confirm google authetication
   */

  public confirmGoogleAuth(code: string) {
    return this.api.executeRequest('POST', `/settings/google-authentication/confirm`, { code });
  }

  /**
   * Fingerprint and pincode
   */

  public addFingerprintAndPinCode(body: object) {
    return this.api.executeRequest('POST', `/fingerprint`, body);
  }

  public clearFingerprint() {
    return this.api.executeRequest('PATCH', '/fingerprint');
  }

  public addPinCode(body: object) {
    return this.api.executeRequest('POST', `/pin-code`, body);
  }

  /**
   * Face recognition
   */

  public bioEnroll() {
    return this.api.executeRequest('GET', '/bio/enroll');
  }

  public bioConfirmEnroll(token: string) {
    return this.api.executeRequest('POST', '/bio/confirm-enroll', { token });
  }

  public changeLanguage(language: string) {
    return this.api.executeRequest('PATCH', `/settings/language/${language}`);
  }

  /**
   * API credentilas for business
   */

  public getApiCredentials() {
    return this.api.executeRequest('GET', '/settings/api-credentials');
  }

  public changeApiCredentialsStatus(body: object) {
    return this.api.executeRequest('POST', '/settings/api-credentials', body);
  }

}
