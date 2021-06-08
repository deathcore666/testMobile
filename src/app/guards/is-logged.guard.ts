import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class IsLoggedGuard implements CanActivate {
  constructor(
    private router: Router,
    private storage: NativeStorage,
    private platform: Platform
  ) { }

  public canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    return this.isAuthentiticated();
  }

  private async isAuthentiticated(): Promise<boolean> {
    await this.platform.ready();

    try {
      const expiration = await this.storage.getItem('expire_at');
      const expiresAt = JSON.parse(expiration);
      const isExpire = moment().isBefore(moment(expiresAt * 1000));

      if (isExpire) {
        this.router.navigate(['/wallets'], { replaceUrl: true });
        return false;
      }

      return true;
    } catch {
      return true;
    }
  }
}
