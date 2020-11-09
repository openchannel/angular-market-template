import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldOptionsComponent } from './field-options.component';

describe('FieldOptionsComponent', () => {
  let component: FieldOptionsComponent;
  let fixture: ComponentFixture<FieldOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
