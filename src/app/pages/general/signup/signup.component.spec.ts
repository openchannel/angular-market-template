import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { SignupComponent } from './signup.component';
import { RouterTestingModule } from '@angular/router/testing';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { MockEditUserTypeService } from '../../../../mock/services.mock';
import { MockSignupCustom } from '../../../../mock/components.mock';
import { mockEditUserTypeService, mockLoadingBarService, mockNativeLoginService } from '../../../../mock/providers.mock';

describe('SignupComponent', () => {
    let component: SignupComponent;
    let fixture: ComponentFixture<SignupComponent>;
    let router: Router;

    const getCustomSignupDE = () => fixture.debugElement.query(By.directive(MockSignupCustom));

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [SignupComponent, MockSignupCustom],
                imports: [RouterTestingModule],
                providers: [mockNativeLoginService(), mockLoadingBarService(), mockEditUserTypeService()],
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
        fixture = TestBed.createComponent(SignupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should complete destroy$ and loaderBar in ngOnDestroy hook', () => {
        jest.spyOn((component as any).destroy$, 'complete');
        jest.spyOn((component as any).loaderBar, 'complete');

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnDestroy();

        expect((component as any).destroy$.complete).toHaveBeenCalled();
        expect((component as any).loaderBar.complete).toHaveBeenCalled();
    });

    it('should call initFormConfigs method in ngOnInit hook', () => {
        jest.spyOn(component as any, 'initFormConfigs');

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnInit();

        expect((component as any).initFormConfigs).toHaveBeenCalled();
    });

    it('should complete loader and set formConfigsLoading=false when ocEditTypeService.injectTypeDataIntoConfigs method completes', fakeAsync(() => {
        jest.spyOn((component as any).loaderBar, 'complete');
        component.formConfigsLoading = true;

        (component as any).initFormConfigs();
        tick();

        expect(component.formConfigsLoading).toBeFalsy();
        expect((component as any).loaderBar.complete).toHaveBeenCalled();
    }));

    it('should complete loader and set formConfigsLoading=false when ocEditTypeService.injectTypeDataIntoConfigs method errors', fakeAsync(() => {
        jest.spyOn((component as any).loaderBar, 'complete');
        component.formConfigsLoading = true;
        (component as any).ocEditTypeService.injectTypeDataIntoConfigs = () => throwError('Error');

        try {
            (component as any).initFormConfigs();
            tick();
        } catch {}

        expect(component.formConfigsLoading).toBeFalsy();
        expect((component as any).loaderBar.complete).toHaveBeenCalled();
    }));

    it('should call ocEditTypeService.injectTypeDataIntoConfigs method with formConfigsWithoutTypeData, injectOrganizationTypes=true, injectAccountTypes=true', () => {
        jest.spyOn((component as any).ocEditTypeService, 'injectTypeDataIntoConfigs');

        (component as any).initFormConfigs();

        expect((component as any).ocEditTypeService.injectTypeDataIntoConfigs).toHaveBeenCalledWith(
            (component as any).formConfigsWithoutTypeData,
            true,
            true,
        );
    });

    it('should set formConfigs with value emitted by ocEditTypeService.injectTypeDataIntoConfigs', fakeAsync(() => {
        component.formConfigs = null;

        (component as any).initFormConfigs();
        tick();

        expect(component.formConfigs).toEqual(MockEditUserTypeService.MOCK_FORM_CONFIGS_RESPONSE);
    }));

    it('should call nativeLoginService.signup when userData exist and inProcess=false', () => {
        jest.spyOn((component as any).nativeLoginService, 'signup');
        const userData = {};
        component.inProcess = false;

        component.onSignup(userData);

        expect((component as any).nativeLoginService.signup).toHaveBeenCalled();
    });

    it('should not call nativeLoginService.signup when userData is not exist', () => {
        jest.spyOn((component as any).nativeLoginService, 'signup');
        const userData = null;
        component.inProcess = false;

        component.onSignup(userData);

        expect((component as any).nativeLoginService.signup).not.toHaveBeenCalled();
    });

    it('should not call nativeLoginService.signup when inProcess=true', () => {
        jest.spyOn((component as any).nativeLoginService, 'signup');
        const userData = {};
        component.inProcess = true;

        component.onSignup(userData);

        expect((component as any).nativeLoginService.signup).not.toHaveBeenCalled();
    });

    it('should set inProcess=true before subscribing to the nativeLoginService.signup', () => {
        const userData = {};
        component.inProcess = false;

        component.onSignup(userData);

        expect(component.inProcess).toBeTruthy();
    });

    it('should set inProcess=false when nativeLoginService.signup completes', fakeAsync(() => {
        const userData = {};
        component.inProcess = false;

        component.onSignup(userData);
        tick();

        expect(component.inProcess).toBeFalsy();
    }));

    it('should set inProcess=false when nativeLoginService.signup errors', fakeAsync(() => {
        const userData = {};
        component.inProcess = false;
        (component as any).nativeLoginService.signup = () => throwError('Error');

        try {
            component.onSignup(userData);
            tick();
        } catch {}

        expect(component.inProcess).toBeFalsy();
    }));

    it('should call nativeLoginService.signup with correct data', () => {
        const userData = {
            account: {
                email: 'email',
            },
            organization: {
                email: 'email',
            },
            password: 'qwerty123',
        };
        component.inProcess = false;
        jest.spyOn((component as any).nativeLoginService, 'signup');

        component.onSignup(userData);

        expect((component as any).nativeLoginService.signup).toHaveBeenCalledWith(userData);
    });

    it('should set showSignupFeedbackPage=true when nativeLoginService.signup successfully completes', fakeAsync(() => {
        const userData = {};
        component.showSignupFeedbackPage = false;
        component.inProcess = false;

        component.onSignup(userData);
        tick();

        expect(component.showSignupFeedbackPage).toBeTruthy();
    }));

    it('should pass all necessary variables to the oc-signup-custom', () => {
        const customSignupBindingsComponentPropsMap = {
            formConfigsLoading: 'formConfigsLoading',
            formConfigs: 'formConfigs',
            loginUrl: 'loginUrl',
            signupUrl: 'signupUrl',
            activationUrl: 'activationUrl',
            companyLogoUrl: 'companyLogoUrl',
            termsUrl: 'termsAndConditionPageUrl',
            policyUrl: 'dataProcessingPolicyUrl',
            process: 'inProcess',
            showSignupFeedbackPage: 'showSignupFeedbackPage',
            forgotPasswordDoneUrl: 'forgotPasswordDoneIconPath',
        };

        const customSignupInstance = getCustomSignupDE().componentInstance;

        Object.values(customSignupBindingsComponentPropsMap).forEach(([binding, propName]) => {
            expect(customSignupInstance[binding]).toEqual(component[propName]);
        });
    });

    it('should call onSignup method with data from the event when oc-signup-custom emits resultUserData', () => {
        const userData = {
            account: {
                email: 'email',
            },
            organization: {
                email: 'email',
            },
            password: 'qwerty123',
        };
        jest.spyOn(component, 'onSignup');

        getCustomSignupDE().triggerEventHandler('resultUserData', userData);

        expect(component.onSignup).toHaveBeenCalledWith(userData);
    });

    it('should set showSignupFeedbackPage=true if the router state has showSignupFeedbackPage=true', () => {
        const routerState = { extras: { state: { showSignupFeedbackPage: true } } };
        router.getCurrentNavigation = jest.fn().mockReturnValue(routerState);

        component = TestBed.createComponent(SignupComponent).componentInstance;
        (component as any).loaderBar = { complete: () => {} };
        fixture.detectChanges();

        expect(component.showSignupFeedbackPage).toBeTruthy();
    });

    it('should set showSignupFeedbackPage=false if the router state doesnt have showSignupFeedbackPage', () => {
        const routerState = { extras: { state: {} } };
        router.getCurrentNavigation = jest.fn().mockReturnValue(routerState);

        component = TestBed.createComponent(SignupComponent).componentInstance;
        (component as any).loaderBar = { complete: () => {} };
        fixture.detectChanges();

        expect(component.showSignupFeedbackPage).toBeFalsy();
    });
});
