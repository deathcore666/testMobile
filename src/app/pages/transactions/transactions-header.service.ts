import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class TransactionHeaderService {
  private header = new Subject<{title: string;}>();

  getHeaderChanges() {
    return this.header.asObservable();
  }

  setHeaderChanges(params: {
    title: string;
  }) {
    this.header.next(params);
  }
}