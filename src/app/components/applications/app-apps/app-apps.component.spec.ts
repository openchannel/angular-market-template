import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppAppsComponent } from './app-apps.component';

describe('AppAppsComponent', () => {
  let component: AppAppsComponent;
  let fixture: ComponentFixture<AppAppsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppAppsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
