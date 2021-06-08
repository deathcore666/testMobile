import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../services/globals.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cancel-page',
  templateUrl: './cancel-page.component.html',
  styleUrls: ['./cancel-page.component.scss'],
})
export class CancelPageComponent implements OnInit {
  public errorMessage: string;

  constructor(
    private translate: TranslateService,
    private globals: Globals,
    private activatedRoute: ActivatedRoute,
  ) {
    this.translate.setDefaultLang(this.globals.language);
    this.activatedRoute.paramMap.subscribe((params: any) => {
      this.errorMessage = JSON.parse(params.params.title);
    });
  }

  ngOnInit() {}

}
