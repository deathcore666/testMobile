import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../../services/globals.service';

@Component({
  selector: 'app-cancel-withdrawal',
  templateUrl: './cancel-withdrawal.page.html',
  styleUrls: ['./cancel-withdrawal.page.scss'],
})
export class CancelWithdrawalPage implements OnInit {
  constructor(
    public translate: TranslateService,
    private globals: Globals
  ) {
    this.translate.setDefaultLang(this.globals.language);
  }

  ngOnInit() {
  }

}
