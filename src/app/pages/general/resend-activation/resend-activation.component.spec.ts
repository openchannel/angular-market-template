import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { ResendActivationComponent } from './resend-activation.component';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NativeLoginService } from '@openchannel/angular-common-services';
import { MockNativeLoginService, MockResendActivation, MockRoutingComponent, MockToastrService } from '../../../../mock/mock';
import { throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';

describe.skip('ResendActivationComponent', () => {
    let component: ResendActivationComponent;
    let fixture: ComponentFixture<ResendActivationComponent>;
    let router: Router;
    let location: Location;

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

        location = TestBed.inject(Location);
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

    it('should call nativeLoginService.sendActivationCode and to check response success actions', fakeAsync(() => {
        jest.spyOn((component as any).nativeLoginService, 'sendActivationCode');

        const ocResendActivationMock = getActivationResendDE().componentInstance;
        ocResendActivationMock.buttonClick.emit(true);
        tick();

        expect(component.inProcess).toBeTruthy();
        expect((component as any).toaster.success).toHaveBeenCalled();
        expect(location.path()).toBe('/login');
    }));

    it('should set inProcess=false when nativeLoginService.sendActivationCode throws error', fakeAsync(() => {
        const ocResendActivationMock = getActivationResendDE().componentInstance;
        ocResendActivationMock.buttonClick.emit(true);
        tick();

        (component as any).nativeLoginService.sendActivationCode = () => throwError('Error');

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
});
