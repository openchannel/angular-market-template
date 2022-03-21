import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { ResendActivationComponent } from './resend-activation.component';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NativeLoginService } from '@openchannel/angular-common-services';
import { MockNativeLoginService, MockResendActivation, MockRoutingComponent, MockToastrService } from '../../../../mock/mock';
import { throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

describe('ResendActivationComponent', () => {
    let component: ResendActivationComponent;
    let fixture: ComponentFixture<ResendActivationComponent>;
    let router: Router;

    const getActivationResendDE = () => fixture.debugElement.query(By.directive(MockResendActivation));

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ResendActivationComponent, MockResendActivation],
                imports: [RouterTestingModule.withRoutes([{ path: 'login', component: MockRoutingComponent }])],
                providers: [
                    { provide: NativeLoginService, useClass: MockNativeLoginService },
                    { provide: ToastrService, useClass: MockToastrService },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        jest.resetAllMocks();
    });

    // Setup router for the component
    beforeEach(() => {
        const routerState = { extras: { state: {} } };

        router = TestBed.inject(Router);
        router.getCurrentNavigation = jest.fn().mockReturnValue(routerState);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ResendActivationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should complete destroy$ in ngOnDestroy hook', () => {
        jest.spyOn((component as any).destroy$, 'complete');

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnDestroy();

        expect((component as any).destroy$.complete).toHaveBeenCalled();
    });

    it('should call nativeLoginService.sendActivationCode when event=true and inProcess=false', () => {
        jest.spyOn((component as any).nativeLoginService, 'sendActivationCode');
        const event = true;
        component.inProcess = false;

        component.sendActivationMail(event);

        expect((component as any).nativeLoginService.sendActivationCode).toHaveBeenCalled();
    });

    it('should not call nativeLoginService.sendActivationCode when event=false', () => {
        jest.spyOn((component as any).nativeLoginService, 'sendActivationCode');
        const event = false;
        component.inProcess = false;

        component.sendActivationMail(event);

        expect((component as any).nativeLoginService.sendActivationCode).not.toHaveBeenCalled();
    });

    it('should not call nativeLoginService.sendActivationCode when inProgress=true', () => {
        jest.spyOn((component as any).nativeLoginService, 'sendActivationCode');
        const event = true;
        component.inProcess = true;

        component.sendActivationMail(event);

        expect((component as any).nativeLoginService.sendActivationCode).not.toHaveBeenCalled();
    });

    it('should set inProcess=true before subscribing to the nativeLoginService.sendActivationCode', () => {
        const event = true;
        component.inProcess = false;

        component.sendActivationMail(event);

        expect(component.inProcess).toBeTruthy();
    });

    it('should set inProcess=false when nativeLoginService.sendActivationCode successfully completes', fakeAsync(() => {
        const event = true;
        component.inProcess = false;

        component.sendActivationMail(event);
        tick();

        expect(component.inProcess).toBeFalsy();
    }));

    it('should show message when nativeLoginService.sendActivationCode successfully completes', fakeAsync(() => {
        jest.spyOn((component as any).toaster, 'success');
        const event = true;
        component.inProcess = false;

        component.sendActivationMail(event);
        tick();
        expect((component as any).toaster.success).toHaveBeenCalled();
    }));

    it('should navigate to /login when nativeLoginService.sendActivationCode successfully completes', fakeAsync(() => {
        const event = true;
        component.inProcess = false;

        component.sendActivationMail(event);
        tick();
        expect(router.url).toBe('/login');
    }));

    it('should set inProcess=false when nativeLoginService.sendActivationCode errors', fakeAsync(() => {
        const event = true;
        component.inProcess = false;
        (component as any).nativeLoginService.sendActivationMail = () => throwError('Error');

        try {
            component.sendActivationMail(event);
            tick();
        } catch {}

        expect(component.inProcess).toBeFalsy();
    }));

    it('should pass all necessary variables to the app-resend-activation', () => {
        const customActivationResendBindingsComponentPropsMap = {
            activationModel: 'activationModel',
            companyLogoUrl: 'companyLogoUrl',
            loginUrl: 'loginUrl',
            signupUrl: 'signupUrl',
            process: 'inProcess',
        };

        const activationResendInstance = getActivationResendDE().componentInstance;

        Object.values(customActivationResendBindingsComponentPropsMap).forEach(([binding, propName]) => {
            expect(activationResendInstance[binding]).toEqual(component[propName]);
        });
    });

    it('should call sendActivationMail method with data from the event when app-resend-activation emits buttonClick', () => {
        const event = true;
        jest.spyOn(component, 'sendActivationMail');

        getActivationResendDE().triggerEventHandler('buttonClick', event);

        expect(component.sendActivationMail).toHaveBeenCalledWith(event);
    });
});
