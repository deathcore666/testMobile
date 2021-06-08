import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  constructor(private apiService: ApiService) { }

  public setPushToken(body) {
    return this.apiService.executeRequest('POST', '/settings/push-notification', body);
  }

  public enablePush(body) {
    return this.apiService.executeRequest('POST', '/settings/push-notification/token', body);
  }
}
