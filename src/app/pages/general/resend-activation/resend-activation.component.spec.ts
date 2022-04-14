import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ResendActivationComponent } from './resend-activation.component';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { asyncScheduler, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { observeOn } from 'rxjs/operators';
import { MockResendActivation, MockRoutingComponent } from '../../../../mock/components.mock';
import { mockNativeLoginService, mockToastrService } from '../../../../mock/providers.mock';

describe('ResendActivationComponent', () => {
    let component: ResendActivationComponent;
    let fixture: ComponentFixture<ResendActivationComponent>;
    let router: Router;
    let location: Location;

    const getActivationResendDE = () => fixture.debugElement.query(By.directive(MockResendActivation));

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ResendActivationComponent, MockResendActivation, MockRoutingComponent],
            imports: [
                RouterTestingModule.withRoutes([
                    { path: 'login', component: MockRoutingComponent },
                    { path: 'resend-activation', component: ResendActivationComponent },
                ]),
            ],
            providers: [mockNativeLoginService(), mockToastrService()],
        }).compileComponents();

        fixture = TestBed.createComponent(ResendActivationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        jest.resetAllMocks();

        // Setup router for the component
        location = TestBed.inject(Location);
        router = TestBed.inject(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call nativeLoginService.sendActivationCode and to check response success actions', fakeAsync(() => {
        jest.spyOn((component as any).toaster, 'success');

        component.inProcess = false;

        const ocResendActivationMock = getActivationResendDE().componentInstance;
        ocResendActivationMock.buttonClick.emit(true);

        expect(component.inProcess).toBeTruthy();

        tick();

        expect(component.inProcess).toBeFalsy();
        expect((component as any).toaster.success).toHaveBeenCalled();
        expect(location.path()).toBe('/login');
    }));

    it('should set inProcess=false when nativeLoginService.sendActivationCode throws error', fakeAsync(() => {
        const path = location.path();
        const ocResendActivationMock = getActivationResendDE().componentInstance;
        (component as any).nativeLoginService.sendActivationCode = () => throwError('Error').pipe(observeOn(asyncScheduler));
        ocResendActivationMock.buttonClick.emit(true);

        expect(component.inProcess).toBeTruthy();

        tick();

        expect(component.inProcess).toBeFalsy();
        expect(location.path()).toBe(path);
    }));

    it('should pass all necessary variables to the app-resend-activation', () => {
        component.activationModel = {
            password: '123123123',
            email: 'mail@mail.com',
            code: '123123123',
        };
        component.inProcess = true;

        fixture.detectChanges();

        const activationResendInstance = getActivationResendDE().componentInstance;

        expect(activationResendInstance.activationModel).toEqual(component.activationModel);
        expect(activationResendInstance.process).toBeTruthy();
    });
});
