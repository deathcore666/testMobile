import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Observable } from 'rxjs';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class IsAuthentiticatedGuard implements CanActivate {
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
      await this.storage.getItem('token');
    } catch (error) {
      this.router.navigate(['/wallets'], { replaceUrl: true });
      return false;
    }

    return true;
  }
}
