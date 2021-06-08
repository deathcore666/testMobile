import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../../services/globals.service';

@Component({
  selector: 'app-success-deposit',
  templateUrl: './success-deposit.page.html',
  styleUrls: ['./success-deposit.page.scss'],
})
export class SuccessDepositPage implements OnInit {
  constructor(
    public translate: TranslateService,
    private globals: Globals
  ) {
    this.translate.setDefaultLang(this.globals.language);
  }

  ngOnInit() {
  }

}
