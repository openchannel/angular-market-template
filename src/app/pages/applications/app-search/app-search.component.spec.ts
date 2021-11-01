import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppSearchComponent } from './app-search.component';

describe('AppSearchComponent', () => {
    let component: AppSearchComponent;
    let fixture: ComponentFixture<AppSearchComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [AppSearchComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(AppSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
