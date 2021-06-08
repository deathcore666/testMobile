import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class HelpersService {

  constructor() { }

  public sort(array: Array<any>, property: string) {
    if (!array) {
      return [];
    }

    array.sort((a, b) => {

      if ( b[property].toLowerCase() > a[property].toLowerCase() ) {
        return 1;
      }
      if ( b[property].toLowerCase() < a[property].toLowerCase() ) {
        return -1;
      }

      return 0;
    });

    return array.reverse();
  }

  public sortNumbers(array: Array<any>, property: string) {
    if (!array) {
      return [];
    }

    array.sort((a, b) => {
      return a[property] - b[property];
    });

    return array.reverse();
  }

  public sortByDate(array: Array<any>, property: string) {
    if (!array) {
      return [];
    }

    array.sort(function(a, b) {
      return Number(moment.utc(a[property])) - Number(moment.utc(b[property]));
    });

    return array.reverse();
  }
}
