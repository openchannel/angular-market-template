import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ButtonActionComponent } from './button-action.component';

describe.skip('ButtonActionComponent', () => {
    let component: ButtonActionComponent;
    let fixture: ComponentFixture<ButtonActionComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ButtonActionComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ButtonActionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
