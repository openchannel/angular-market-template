import { ComponentFixture, TestBed, waitForAsync, tick, fakeAsync } from '@angular/core/testing';

import { ForgotPasswordComponent } from './forgot-password.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NativeLoginService } from '@openchannel/angular-common-services';

import { MockNativeLoginService, MockNgbModal, MockOcForgotPasswordComponent } from '../../../../mock/mock';

import { throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ForgotPasswordComponent', () => {
    let component: ForgotPasswordComponent;
    let fixture: ComponentFixture<ForgotPasswordComponent>;

    const getForgotPasswordDE = () => fixture.debugElement.query(By.directive(MockOcForgotPasswordComponent));
    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ForgotPasswordComponent, MockOcForgotPasswordComponent],
                providers: [
                    { provide: NgbModal, useClass: MockNgbModal },
                    { provide: NativeLoginService, useClass: MockNativeLoginService },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ForgotPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should complete destroy$ in ngOnDestroy hook', () => {
        jest.spyOn((component as any).destroy$, 'complete');

        fixture.destroy();

        expect((component as any).destroy$.complete).toHaveBeenCalled();
    });

    it('check rendered of oc-forgot-password element', () => {
        component.inProcess = false;

        const activateElement = fixture.debugElement.query(By.css('.forgot-pass-position'));
        expect(activateElement).toBeTruthy();
    });

    it('pass all necessary variables to the forgot-password', fakeAsync(() => {
        component.signIn = {
            uname:'tes',
            password: 'tes',
            email: 'te',
            company: 'sss',
            isChecked: true,
        };
        fixture.detectChanges();
        tick();
        const getForgotInstance = getForgotPasswordDE().componentInstance;
        expect(getForgotInstance.loginModel).toEqual(component.signIn);
        expect(getForgotInstance.process).toBe(component.inProcess);
    }));

    it('check call reset-password function by click', fakeAsync(() => {
        const activationInstance = getForgotPasswordDE().componentInstance;
        jest.spyOn(component, 'resetPwd');
        activationInstance.buttonClick.emit(true);
        tick();
        expect(component.resetPwd).toBeCalled();
        expect(component.showResultPage).toBeTruthy();
    }));

    it('if bad request to server should drop resets-password and showResultPage be falsy', fakeAsync(() => {
        (component as any).nativeLoginService.sendResetCode = () => throwError('Error');
        jest.spyOn(component, 'resetPwd');
        component.resetPwd();
        tick();
        expect(component.showResultPage).toBeFalsy();
    }));

    it('check to block function while resetPwd work', fakeAsync(() => {
        const activationInstance = getForgotPasswordDE().componentInstance;
        jest.spyOn(component, 'resetPwd');
        activationInstance.buttonClick.emit(true);
        tick();
        expect(component.resetPwd).toBeCalled();
        expect(component.showResultPage).toBeTruthy();
        expect(component.inProcess).toBeFalsy();
        // simulate multi click(doable time request password reset)
        component.inProcess = true;
        component.showResultPage = false;
        activationInstance.buttonClick.emit(true);
        tick();
        expect(component.resetPwd).toBeCalled();
        expect(component.showResultPage).toBeFalsy();
        expect(component.inProcess).toBeTruthy();
    }));
});
