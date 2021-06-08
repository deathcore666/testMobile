import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Observable } from 'rxjs';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class IsAccountApprovedGuard implements CanActivate {
  private confirmToken: any;

  constructor(
    private router: Router,
    private storage: NativeStorage,
    private platform: Platform
  ) { }

  public canActivate(): Observable<boolean> | Promise<boolean> | boolean  {
    return this.isApproved();
  }

  public async isApproved(): Promise<boolean> {
    await this.platform.ready();

    try {
      const isApproved = await this.storage.getItem('acountAproved');

      if (isApproved) {
        if (this.confirmToken) {
          this.router.navigate(['/enter-password', { confirmToken: this.confirmToken }], { replaceUrl: true });
        } else {
          this.router.navigate(['/enter-password'], { replaceUrl: true });
        }
        return false;
      }
      return true;
    } catch (error) {
      return true;
    }
  }

  public getToken(token: string) {
    this.confirmToken = token;
  }
}
