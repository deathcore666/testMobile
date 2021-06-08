import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  constructor( private api: ApiService ) { }

  public getActivity(skip, limit = 10) {
    return this.api.executeRequest('get', `/activity/${limit}/${skip}`);
  }
}
