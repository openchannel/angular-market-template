import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldPreviewModalComponent } from './field-preview-modal.component';

describe('FieldPreviewModalComponent', () => {
  let component: FieldPreviewModalComponent;
  let fixture: ComponentFixture<FieldPreviewModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldPreviewModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldPreviewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
