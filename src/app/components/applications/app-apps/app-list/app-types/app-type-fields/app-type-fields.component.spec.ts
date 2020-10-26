import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTypeFieldsComponent } from './app-type-fields.component';

describe('AppTypeFieldsComponent', () => {
  let component: AppTypeFieldsComponent;
  let fixture: ComponentFixture<AppTypeFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppTypeFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTypeFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
