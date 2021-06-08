import { Component, OnInit } from '@angular/core';
import { Globals } from '../../../services/globals.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-success-purchase',
  templateUrl: './success-purchase.page.html',
  styleUrls: ['./success-purchase.page.scss'],
})

export class SuccessPurchasePage implements OnInit {
  constructor(private globals: Globals, private translate: TranslateService) {
    this.translate.setDefaultLang(this.globals.language);
  }

  ngOnInit() {}
}
