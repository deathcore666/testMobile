import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../services/globals.service';

@Component({
  selector: 'app-success-page',
  templateUrl: './success-page.component.html',
  styleUrls: ['./success-page.component.scss'],
})
export class SuccessPageComponent implements OnInit {

  constructor(
    private translate: TranslateService,
    private globals: Globals
  ) {
    this.translate.setDefaultLang(this.globals.language);
  }

  ngOnInit() {}

}
