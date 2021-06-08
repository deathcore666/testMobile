import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import Hammer from 'hammerjs';

import { Subscription } from "rxjs";
import { Globals } from '../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { TransactionHeaderService } from './transactions-header.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})

export class TransactionsPage implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private _hammer: any;

  public transactionType: string;
  public title: string;

  constructor(
    private headerService: TransactionHeaderService,
    private elementRef: ElementRef,
    private platform:  Platform,
    private globals: Globals,
    private translate: TranslateService,
    private router: Router,
  ) {
    this.enableSwipe();
    this.translate.setDefaultLang(this.globals.language);
  }

  ngOnInit() {
    const subHeader = this.headerService.getHeaderChanges().subscribe(res => {
      this.title = res.title;
    });
    this.subs.push(subHeader);
  }

  ngOnDestroy() {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }

    if (this._hammer) {
      this._hammer.off('swipe', this.swipe);

      this._hammer.destroy();
      this._hammer = null;
    }
  }

  public swipe(event) {
    const rout = window.location.pathname.split('/').pop();
    const swipeSections = {
      leftSwipe: {
        'outgoing': 'incoming',
        'incoming': 'exchange',
        'exchange': 'purchase',
        'purchase': 'deposit',
        'deposit': 'withdrawal',
        'withdrawal': 'outgoing'
      },
      rightSwipe: {
        'withdrawal': 'deposit',
        'deposit': 'purchase',
        'purchase': 'exchange',
        'exchange': 'incoming',
        'incoming': 'outgoing',
        'outgoing': 'withdrawal'
      }
    };

    const position = (event.direction === 2) ? 'leftSwipe' : 'rightSwipe';
    this.transactionType = swipeSections[position][rout];
    this.router.navigate([`transactions/${this.transactionType}`], { replaceUrl: true });
  }

  private enableSwipe() {
    if (this.platform.is('android')) {
      const element = this.elementRef.nativeElement;
      this._hammer = new Hammer.Manager(element, {
        recognizers: [
          [Hammer.Pan, { direction: Hammer.DIRECTION_VERTICAL }],
          [Hammer.Swipe]
        ],
      });

      this._hammer.on('swipe', this.swipe);
    }
  }
}
