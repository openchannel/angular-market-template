import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTypesComponent } from './app-types.component';

describe('AppTypesComponent', () => {
  let component: AppTypesComponent;
  let fixture: ComponentFixture<AppTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
