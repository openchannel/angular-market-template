import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapseWithTitleComponent } from './collapse-with-title.component';

describe('CollapseWithTitleComponent', () => {
  let component: CollapseWithTitleComponent;
  let fixture: ComponentFixture<CollapseWithTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollapseWithTitleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollapseWithTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
