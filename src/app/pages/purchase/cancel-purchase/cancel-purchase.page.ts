import { Component, OnInit } from '@angular/core';
import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-cancel-purchase',
  templateUrl: './cancel-purchase.page.html',
  styleUrls: ['./cancel-purchase.page.scss'],
})
export class CancelPurchasePage implements OnInit {
  constructor(
    private globals: Globals,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang(this.globals.language);
  }

  ngOnInit() {
  }
}
