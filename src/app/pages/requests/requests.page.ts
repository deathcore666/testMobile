import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { Platform } from '@ionic/angular';
import Hammer from 'hammerjs';
import { Router } from '@angular/router';

@Component({
  selector: "app-requests",
  templateUrl: "./requests.page.html",
  styleUrls: ["./requests.page.scss"]
})
export class RequestsPage implements OnInit, OnDestroy {
  public requestType: string;
  private _hammer: any;

  constructor(
    private platform:  Platform,
    private elementRef: ElementRef,
    private router: Router
  ) { }

  ngOnInit() {
    this.enableSwipe();
  }
  ngOnDestroy() {
    if (this._hammer) {
      this._hammer.off('swipe', this.swipe);

      this._hammer.destroy();
      this._hammer = null;
    }
  }

  public swipe(event) {
    const rout = this.router.url.split('/').pop();
    const swipeSections = {
      leftSwipe: {
        'outcome-request': 'income-request',
        'income-request': 'outcome-request'
      },
      rightSwipe: {
        'income-request': 'outcome-request',
        'outcome-request': 'income-request'
      }
    };

    const position = (event.direction === 2) ? 'leftSwipe' : 'rightSwipe';
    this.requestType = swipeSections[position][rout];
    this.router.navigate([`requests/${this.requestType}`], { replaceUrl: true });
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
