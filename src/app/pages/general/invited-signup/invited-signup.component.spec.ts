import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { InvitedSignupComponent } from './invited-signup.component';
import {
    MockAuthenticationService,
    MockEditUserTypeService,
    mockInviteUserServiceProvider,
    MockLoadingBarService,
    MockLogOutService,
    MockNativeLoginService,
    MockRoutingComponent,
    MockSignupCustom,
    MockToastrService,
    MockUserAccountTypesService,
} from '../../../../mock/mock';
import { RouterTestingModule } from '@angular/router/testing';
import {
    AuthenticationService,
    InviteUserService,
    NativeLoginService,
    UserAccountTypesService,
} from '@openchannel/angular-common-services';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { OcEditUserTypeService } from '@core/services/user-type-service/user-type.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LogOutService } from '@core/services/logout-service/log-out.service';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

describe('InvitedSignupComponent', () => {
    let component: InvitedSignupComponent;
    let fixture: ComponentFixture<InvitedSignupComponent>;
    let router: Router;
    let acivateRoute: ActivatedRoute;
    const tokenValue = '24fkzrw3487943uf358lovd';

    const InvitedSignupComponentDE = () => fixture.debugElement.query(By.directive(MockSignupCustom));
    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [InvitedSignupComponent, MockSignupCustom, MockRoutingComponent],
                imports: [
                    RouterTestingModule.withRoutes([
                        {
                            path: 'login',
                            component: MockRoutingComponent,
                        },
                        {
                            path: ':token',
                            component: MockRoutingComponent,
                        },
                    ]),
                ],
                providers: [
                    { provide: NativeLoginService, useClass: MockNativeLoginService },
                    { provide: LoadingBarService, useClass: MockLoadingBarService },
                    { provide: OcEditUserTypeService, useClass: MockEditUserTypeService },
                    { provide: ToastrService, useClass: MockToastrService },
                    { provide: LogOutService, useClass: MockLogOutService },
                    { provide: OcEditUserTypeService, useClass: MockEditUserTypeService },
                    { provide: AuthenticationService, useClass: MockAuthenticationService },
                    { provide: UserAccountTypesService, useClass: MockUserAccountTypesService },
                    {
                        provide: ActivatedRoute,
                        useValue: {
                            snapshot: { params: { token: tokenValue } },
                        },
                    },
                    mockInviteUserServiceProvider([]),
                ],
            }).compileComponents();
            router = TestBed.inject(Router);
            acivateRoute = TestBed.inject(ActivatedRoute);
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(InvitedSignupComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should complete destroy$ and loaderBar in ngOnDestroy hook', () => {
        fixture.detectChanges();
        jest.spyOn((component as any).destroy$, 'complete');
        jest.spyOn((component as any).loaderBar, 'complete');

        fixture.destroy();
        expect((component as any).destroy$.complete).toHaveBeenCalled();
        expect((component as any).loaderBar.complete).toHaveBeenCalled();
    });

    it('check rendered of invited-signup element', () => {
        fixture.detectChanges();
        const activateElement = fixture.debugElement.query(By.css('.signup-position'));
        expect(activateElement).toBeTruthy();
    });

    it('test ngInit call function', () => {
        jest.spyOn(component as any, 'checkSSO');
        jest.spyOn(component, 'getInviteDetails');
        fixture.detectChanges();
        expect((component as any).checkSSO).toHaveBeenCalled();
        expect(component.getInviteDetails).toHaveBeenCalled();
    });

    it('test checkSSO call function', fakeAsync(() => {
        fixture.detectChanges();
        jest.spyOn((component as any).authService, 'getAuthConfig');
        (component as any).checkSSO();
        tick();
        expect((component as any).authService.getAuthConfig).toHaveBeenCalled();
        expect(router.url).toEqual('/login');
    }));

    it('test getInviteDetails if token undefined then loaderBar.complete and stay on the same page', fakeAsync(() => {
        fixture.detectChanges();
        jest.spyOn((component as any).loaderBar, 'complete');
        acivateRoute.snapshot.params.token = undefined;

        component.getInviteDetails();
        tick();
        expect((component as any).loaderBar.complete).toBeCalled();
        expect(router.url).toEqual('/');
    }));

    it('test getInviteDetails if bad request on server should show notification with error', fakeAsync(() => {
        fixture.detectChanges();
        const inviteUserService = TestBed.inject(InviteUserService);
        const toastrService = TestBed.inject(ToastrService);
        jest.spyOn(component as any, 'getInviteDetails');
        jest.spyOn(inviteUserService, 'getUserInviteInfoByToken');
        jest.spyOn(toastrService, 'error');
        jest.spyOn((component as any).loaderBar, 'complete');
        (component as any).inviteUserService.getUserInviteInfoByToken = () => throwError('Error');
        component.getInviteDetails();
        tick();
        expect((component as any).loaderBar.complete).toBeCalled();
        expect(toastrService.error).toBeCalled();
    }));

    it('test getInviteDetails if good request to  inviteUserService and userInviteData.expireDate is Expired', fakeAsync(() => {
        fixture.detectChanges();
        jest.spyOn(component as any, 'getInviteDetails');
        const inviteUserService = TestBed.inject(InviteUserService);
        jest.spyOn(inviteUserService, 'getUserInviteInfoByToken');
        jest.spyOn((component as any).loaderBar, 'complete');
        jest.spyOn((component as any).loaderBar, 'start');
        component.getInviteDetails();

        tick();
        expect((component as any).loaderBar.start).toHaveBeenCalled();
        expect(inviteUserService.getUserInviteInfoByToken).toHaveBeenCalled();
        expect((component as any).loaderBar.complete).toHaveBeenCalled();
        expect(component.isExpired).toBeTruthy();
    }));

    it('test getInviteDetails if good request to inviteUserService and userInviteData.expireDate is not Expired', fakeAsync(() => {
        const mockInviteUserModelGoodResponse = {
            userInviteId: '0000012',
            userInviteTemplateId: '123123wwq2131',
            userId: '123123wwq2131',
            userAccountId: '123123wwq2131',
            email: '123',
            expireDate: 213312312312313,
            expireSeconds: 2133123123132,
            createdDate: 21331231231321221,
            subject: '123',
            body: '123',
            name: '123',
            type: '123',
            customData: '123',
            token: '123',
            lastSent: 2133123123132,
            roles: ['user'],
            permissions: ['user'],
        };

        fixture.detectChanges();
        const inviteUserService = TestBed.inject(InviteUserService);
        jest.spyOn(inviteUserService, 'getUserInviteInfoByToken').mockReturnValue(of(mockInviteUserModelGoodResponse));
        jest.spyOn(component, 'getFormConfigs');
        const uerAccountTypesService = TestBed.inject(UserAccountTypesService);
        jest.spyOn(uerAccountTypesService, 'getUserAccountType');
        jest.spyOn(component as any, 'mapUserAccountTypeToFormConfigs');
        jest.spyOn(component as any, 'getFormConfigsWithConfiguredFields');
        jest.spyOn((component as any).loaderBar, 'complete');

        //Testing scenario

        // remember configs for compare with function result end-works
        const memoFormConfigs = component.formConfigs;

        tick();
        component.getInviteDetails();
        expect(component.getFormConfigs).toHaveBeenCalled();
        // call getFormConfigs expected to trigger
        expect(uerAccountTypesService.getUserAccountType).toHaveBeenCalled();
        expect((component as any).mapUserAccountTypeToFormConfigs).toHaveBeenCalled();
        expect((component as any).getFormConfigsWithConfiguredFields).toHaveBeenCalled();
        expect((component as any).loaderBar.complete).toHaveBeenCalled();
        expect(component.formConfigsLoading).toBeFalsy();
        expect(memoFormConfigs).not.toEqual(component.formConfigs);

        const userAccountType = {
            userAccountTypeId: '1312sad123',
            createdDate: 12345678,
            fields: [
                {
                    id: 'as1231321123',
                    label: 'somelable',
                    type: 'strongtype',
                },
            ],
        };

        const expampleOfReturnOcEditUserFormConfigArray = [
            {
                name: '',
                account: {
                    type: '1312sad123',
                    typeData: { ...userAccountType },
                    includeFields: ['as1231321123'],
                },
            },
        ];
        fixture.detectChanges();
        const returnData = (component as any).getFormConfigsWithConfiguredFields(expampleOfReturnOcEditUserFormConfigArray);
        expect(returnData).toEqual(expampleOfReturnOcEditUserFormConfigArray);
    }));

    it('should update formConfig and complete loaderBar if getFormConfigs userAccountTypeId===undefined good request', fakeAsync(() => {
        fixture.detectChanges();
        const ocEditUserTypeService = TestBed.inject(OcEditUserTypeService);
        jest.spyOn(ocEditUserTypeService, 'injectTypeDataIntoConfigs');
        jest.spyOn(component as any, 'mapUserAccountTypeToFormConfigs');
        jest.spyOn(component as any, 'getFormConfigsWithConfiguredFields');
        jest.spyOn((component as any).loaderBar, 'complete');

        const memoFormConfigs = component.formConfigs;
        component.getFormConfigs(undefined);

        tick();
        expect(ocEditUserTypeService.injectTypeDataIntoConfigs).toHaveBeenCalled();
        expect((component as any).loaderBar.complete).toHaveBeenCalled();
        expect(component.formConfigsLoading).toBeFalsy();
        expect(memoFormConfigs).not.toEqual(component.formConfigs);
    }));

    it('should return valid value from mapUserAccountTypeToFormConfigs', () => {
        const userAccountType = {
            userAccountTypeId: '1312sad123',
            createdDate: 12345678,
            fields: [
                {
                    id: 'as1231321123',
                    label: 'somelable',
                    type: 'strongtype',
                },
            ],
        };

        const expampleOfReturnOcEditUserFormConfigArray = [
            {
                name: '',
                account: {
                    type: '1312sad123',
                    typeData: { ...userAccountType },
                    includeFields: ['as1231321123'],
                },
            },
        ];
        fixture.detectChanges();
        const returnData = (component as any).mapUserAccountTypeToFormConfigs(userAccountType);
        expect(returnData).toEqual(expampleOfReturnOcEditUserFormConfigArray);
    });

    it('test injectInviteDataToField should return valid value', () => {
        fixture.detectChanges();
        let testAppFormField = {
            id: '1123123company',
            type: 'some type',
            createDate: 123123123,
            defaultValue: '',
            fields: [
                {
                    formId: 'asda123',
                    name: 'some name',
                },
            ],
        };

        // init userInviteData
        component.userInviteData = {
            customData: {
                company: 'company',
            },
        };

        const exampleDataForCompany = {
            id: '1123123company',
            type: 'some type',
            createDate: 123123123,
            defaultValue: 'company',
            fields: [{ formId: 'asda123', name: 'some name' }],
        };

        let returnData = (component as any).injectInviteDataToField(testAppFormField);
        expect(returnData).toEqual(exampleDataForCompany);
        // change one field for testing other block
        testAppFormField.id = '1123123customData';
        const exampleDataForCustomData = {
            id: '1123123customData',
            type: 'some type',
            createDate: 123123123,
            defaultValue: 'company',
            fields: [{ formId: 'asda123', name: 'some name' }],
        };
        returnData = (component as any).injectInviteDataToField(testAppFormField);
        expect(returnData).toEqual(exampleDataForCustomData);
    });

    it('should show SignupFeedbackPage and end process if submitForm call with good request', fakeAsync(() => {
        fixture.detectChanges();
        const nativeLoginService = TestBed.inject(NativeLoginService);
        const LogOut = TestBed.inject(LogOutService);
        jest.spyOn(nativeLoginService, 'signupByInvite');
        jest.spyOn(LogOut, 'logOut');
        jest.spyOn((component as any).loaderBar, 'start');
        jest.spyOn((component as any).loaderBar, 'complete');

        let userData = {
            account: {
                name: 'testName',
                username: 'testUsername',
                type: 'user',
                email: 'mail@mail',
                customData: 'Soma data',
            },
            organization: {
                name: 'testName',
                username: 'testUsername',
                type: 'user',
                email: 'mail@mail',
                customData: 'Soma data',
            },
            password: '',
        };

        component.submitForm(userData);
        expect(component.inProcess).toBeTruthy();
        expect(nativeLoginService.signupByInvite).toBeCalled();
        expect((component as any).loaderBar.start).toBeCalled();
        tick();
        expect(LogOut.logOut).toBeCalled();
        expect(component.inProcess).toBeFalsy();
        expect(component.showSignupFeedbackPage).toBeTruthy();
        expect((component as any).loaderBar.complete).toBeCalled();
    }));

    it('should end process if  call submitForm with bad request and trigger error', fakeAsync(() => {
        fixture.detectChanges();

        const NativeLogin = TestBed.inject(NativeLoginService);
        jest.spyOn(NativeLogin, 'signupByInvite');
        jest.spyOn((component as any).loaderBar, 'start');
        jest.spyOn((component as any).loaderBar, 'complete');

        let userData = {
            account: {
                name: 'testName',
                username: 'testUsername',
                type: 'user',
                email: 'mail@mail',
                customData: 'Soma data',
            },
            organization: {
                name: 'testName',
                username: 'testUsername',
                type: 'user',
                email: 'mail@mail',
                customData: 'Soma data',
            },
            password: '',
        };

        NativeLogin.signupByInvite = () => throwError('Error');
        component.submitForm(userData);
        tick();
        expect(component.inProcess).toBeFalsy();
        expect(component.showSignupFeedbackPage).toBeFalsy();
        expect((component as any).loaderBar.complete).toBeCalled();
    }));

    it('pass all necessary variables to the oc-signup-custom and test resultUserData event', fakeAsync(() => {
        fixture.detectChanges();
        jest.spyOn(component, 'submitForm');

        const userAccountType = {
            userAccountTypeId: '1312sad123',
            createdDate: 12345678,
            fields: [
                {
                    id: 'as1231321123',
                    label: 'somelable',
                    type: 'strongtype',
                },
            ],
        };

        const OcEditUserFormConfig = {
            name: '',
            account: {
                type: '1312sad123',
                typeData: { ...userAccountType },
                includeFields: ['as1231321123'],
            },
        };
        (component as any).formConfigs = OcEditUserFormConfig;
        fixture.detectChanges();
        const SubmitInvitedSignupComponent = InvitedSignupComponentDE().componentInstance;
        SubmitInvitedSignupComponent.resultUserData.emit(true);
        tick();
        expect(component.submitForm).toHaveBeenCalled();
        const resetPasswordInstance = InvitedSignupComponentDE().componentInstance;
        expect(resetPasswordInstance.formConfigs).toEqual(component.formConfigs);
    }));
});
