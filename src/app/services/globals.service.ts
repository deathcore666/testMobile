import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Globals {
  private _language: string = 'en';
  private _hidePinCode: boolean;

  constructor() {}

  get language() {
    return this._language;
  }
  
  set language(language: string) {
    this._language = language;
  }

  get hideFingerprint() {
    return this._hidePinCode;
  }

  set hideFingerprint(hidePinCode: boolean) {
    this._hidePinCode = hidePinCode;
  }
}
