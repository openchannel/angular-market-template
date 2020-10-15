import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAppDetailComponent } from './edit-app-detail.component';

describe('EditAppDetailComponent', () => {
  let component: EditAppDetailComponent;
  let fixture: ComponentFixture<EditAppDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAppDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAppDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
