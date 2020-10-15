import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFieldModalComponent } from './add-field-modal.component';

describe('AddFieldModalComponent', () => {
  let component: AddFieldModalComponent;
  let fixture: ComponentFixture<AddFieldModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFieldModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFieldModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
