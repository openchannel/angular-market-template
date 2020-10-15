import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionsDataViewModalComponent } from './submissions-data-view-modal.component';

describe('SubmissionsDataViewModalComponent', () => {
  let component: SubmissionsDataViewModalComponent;
  let fixture: ComponentFixture<SubmissionsDataViewModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmissionsDataViewModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionsDataViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
