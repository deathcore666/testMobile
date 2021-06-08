import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../../services/globals.service';

@Component({
  selector: 'app-cancel-deposit',
  templateUrl: './cancel-deposit.page.html',
  styleUrls: ['./cancel-deposit.page.scss'],
})
export class CancelDepositPage implements OnInit {

  constructor(
    private translate: TranslateService,
    private globals: Globals
  ) {
    this.translate.setDefaultLang(this.globals.language);
  }

  ngOnInit() {
  }

}
