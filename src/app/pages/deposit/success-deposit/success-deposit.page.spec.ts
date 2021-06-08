import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessDepositPage } from './success-deposit.page';

describe('SuccessDepositPage', () => {
  let component: SuccessDepositPage;
  let fixture: ComponentFixture<SuccessDepositPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuccessDepositPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessDepositPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
