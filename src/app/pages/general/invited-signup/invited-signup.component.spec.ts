import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InvitedSignupComponent } from './invited-signup.component';

describe('InvitedSignupComponent', () => {
    let component: InvitedSignupComponent;
    let fixture: ComponentFixture<InvitedSignupComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [InvitedSignupComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(InvitedSignupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
