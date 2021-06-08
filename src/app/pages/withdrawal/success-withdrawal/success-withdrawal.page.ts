import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../../services/globals.service';

@Component({
  selector: 'app-success-withdrawal',
  templateUrl: './success-withdrawal.page.html',
  styleUrls: ['./success-withdrawal.page.scss'],
})
export class SuccessWithdrawalPage implements OnInit {
  constructor(
    public translate: TranslateService,
    private globals: Globals
  ) {
    this.translate.setDefaultLang(this.globals.language);
  }

  ngOnInit() {
  }

}
