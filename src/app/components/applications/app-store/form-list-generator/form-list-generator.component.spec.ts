import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormListGeneratorComponent } from './form-list-generator.component';

describe('FormListGeneratorComponent', () => {
  let component: FormListGeneratorComponent;
  let fixture: ComponentFixture<FormListGeneratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormListGeneratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormListGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
