import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  constructor(private api: ApiService) { }

  /**
   * Sign up and confirm sign up
   */

  public signUp(body: object) {
    return this.api.executeRequest( 'POST', `/sign-up`, body, false);
  }

  public confirmRegistration(token: string) {
    return this.api.executeRequest( 'POST', `/sign-up/confirm`, { token }, false);
  }

  /**
   * Get auth type by email (first step in authorization)
   */

  public getAuthType(email: string) {
    return this.api.executeRequest( 'GET', `/auth-type/${email}`, {}, false);
  }

  /**
   * Sign in after enter password
   */

  public signIn(body: object) {
    return this.api.executeRequest( 'POST', `/sign-in`, body, false);
  }

  /**
   * Sign in after enter verify code
   */

  public verify(body: object) {
    return this.api.executeRequest( 'POST', `/verify`, body, false);
  }

  public resendToken(email: string) {
    return this.api.executeRequest( 'POST', `/resend-verify-code`, { email }, false);
  }

  /**
   * Routes for forgot password and reset new password
   */

  public forgotPassword(email: string) {
    return this.api.executeRequest( 'POST', `/forgot-password`, { email }, false);
  }

  public resetPassword(body: object) {
    return this.api.executeRequest( 'POST', `/reset-password`, body, false);
  }

  /**
   * Sign in with finger pirnt and pincode
   */

  public signInWithFingerprint(body: object) {
    return this.api.executeRequest( 'POST', `/fingerprint/sign-in`, body, false);
  }

  public signInWithPinCode(body: object) {
    return this.api.executeRequest( 'POST', `/pin-code/sign-in`, body, false);
  }

  public confirmPinCode(body: object) {
    return this.api.executeRequest( 'POST', `/pin-code/confirm`, body, false);
  }

  /**
   * Sign in with face recognition
   */

  public startBioVerify(email: string) {
    return this.api.executeRequest( 'POST', '/bio/start-verify', { email }, false);
  }

  public confirmBioVerify(token: string) {
    return this.api.executeRequest('POST', '/bio/confirm-verify', { token }, false);
  }
}
