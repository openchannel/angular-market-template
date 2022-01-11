import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingHistoryComponent } from './billing-history.component';

describe('BillingHistoryComponent', () => {
    let component: BillingHistoryComponent;
    let fixture: ComponentFixture<BillingHistoryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BillingHistoryComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BillingHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
