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
import { AuthenticationService, NativeLoginService, UserAccountTypesService } from '@openchannel/angular-common-services';
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

    it('test ngInit; create', () => {
        jest.spyOn(component as any, 'checkSSO');
        jest.spyOn(component as any, 'getInviteDetails');
        fixture.detectChanges();
        expect((component as any).checkSSO).toHaveBeenCalled();
        expect((component as any).getInviteDetails).toHaveBeenCalled();
    });

    it('test ngInit call function', () => {
        fixture.detectChanges();
        jest.spyOn(component as any, 'checkSSO');
        jest.spyOn(component as any, 'getInviteDetails');
        component.ngOnInit();
        expect((component as any).checkSSO).toHaveBeenCalled();
        expect((component as any).getInviteDetails).toHaveBeenCalled();
    });

    it('test ngInit call function', () => {
        fixture.detectChanges();
        jest.spyOn(component as any, 'checkSSO');
        jest.spyOn(component as any, 'getInviteDetails');
        component.ngOnInit();
        expect((component as any).checkSSO).toHaveBeenCalled();
        expect((component as any).getInviteDetails).toHaveBeenCalled();
    });

    it('test checkSSO call function', fakeAsync(() => {
        fixture.detectChanges();
        jest.spyOn((component as any).authService, 'getAuthConfig');
        (component as any).checkSSO();
        tick();
        expect((component as any).authService.getAuthConfig).toHaveBeenCalled();
        expect(router.url).toEqual('/login');
    }));

    it('test getInviteDetails if token undefined then on loaderBar.complete and stay on the same page', fakeAsync(() => {
        fixture.detectChanges();
        jest.spyOn((component as any).loaderBar, 'complete');
        acivateRoute.snapshot.params.token = undefined;

        component.getInviteDetails();
        tick();
        expect((component as any).loaderBar.complete).toBeCalled();
        expect(router.url).toEqual('/');
    }));

    it('if bad request on server should show notification with error', fakeAsync(() => {
        fixture.detectChanges();
        jest.spyOn(component as any, 'getInviteDetails');
        jest.spyOn((component as any).inviteUserService, 'getUserInviteInfoByToken');
        jest.spyOn((component as any).toaster, 'error');
        jest.spyOn((component as any).loaderBar, 'complete');
        (component as any).inviteUserService.getUserInviteInfoByToken = () => throwError('Error');
        component.getInviteDetails();
        tick();
        expect((component as any).loaderBar.complete).toBeCalled();
        expect((component as any).toaster.error).toBeCalled();
    }));

    it('if good request to  inviteUserService and userInviteData.expireDate is Expired', fakeAsync(() => {
        fixture.detectChanges();
        jest.spyOn(component as any, 'getInviteDetails');
        jest.spyOn((component as any).inviteUserService, 'getUserInviteInfoByToken');
        jest.spyOn((component as any).loaderBar, 'complete');
        jest.spyOn((component as any).loaderBar, 'start');
        component.getInviteDetails();
        tick();
        expect((component as any).loaderBar.start).toHaveBeenCalled();
        expect((component as any).getInviteDetails).toHaveBeenCalled();
        expect((component as any).loaderBar.complete).toHaveBeenCalled();
        expect(component.isExpired).toBeTruthy();
    }));

    it('if good request to inviteUserService and userInviteData.expireDate is not Expired', fakeAsync(() => {
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
        jest.spyOn((component as any).inviteUserService, 'getUserInviteInfoByToken').mockReturnValue(of(mockInviteUserModelGoodResponse));
        jest.spyOn(component as any, 'getFormConfigs');
        jest.spyOn(component as any, 'getInviteDetails');
        tick();
        component.getInviteDetails();

        expect((component as any).getInviteDetails).toHaveBeenCalled();
        expect((component as any).getFormConfigs).toHaveBeenCalled();
    }));

    it('should update formConfig and complete loaderBar if getFormConfigs userAccountTypeId!==undefined and  userAccountTypeId!=="" good request', fakeAsync(() => {
        fixture.detectChanges();

        jest.spyOn((component as any).typeService, 'getUserAccountType');
        jest.spyOn(component as any, 'mapUserAccountTypeToFormConfigs');
        jest.spyOn(component as any, 'getFormConfigsWithConfiguredFields');
        jest.spyOn((component as any).loaderBar, 'complete');

        const memoFormConfigs = component.formConfigs;
        component.getFormConfigs('123123123');

        tick();
        expect((component as any).typeService.getUserAccountType).toHaveBeenCalled();
        expect((component as any).mapUserAccountTypeToFormConfigs).toHaveBeenCalled();
        expect((component as any).getFormConfigsWithConfiguredFields).toHaveBeenCalled();
        expect((component as any).loaderBar.complete).toHaveBeenCalled();
        expect(component.formConfigsLoading).toBeFalsy();
        expect(memoFormConfigs).not.toEqual(component.formConfigs);
    }));

    it('should update formConfig and complete loaderBar if getFormConfigs userAccountTypeId===undefined good request', fakeAsync(() => {
        fixture.detectChanges();
        jest.spyOn((component as any).ocEditTypeService, 'injectTypeDataIntoConfigs');
        jest.spyOn(component as any, 'mapUserAccountTypeToFormConfigs');
        jest.spyOn(component as any, 'getFormConfigsWithConfiguredFields');
        jest.spyOn((component as any).loaderBar, 'complete');

        const memoFormConfigs = component.formConfigs;
        component.getFormConfigs(undefined);

        tick();
        expect((component as any).ocEditTypeService.injectTypeDataIntoConfigs).toHaveBeenCalled();
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

    it('should return valid value from getFormConfigsWithConfiguredFields', () => {
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

    it('test disableField should return valid value if fieldsIdsToDisable.includes(field.id)', () => {
        let testAppFormField = {
            id: 'customData.company',
            type: 'some type',
            createDate: 123123123,
            defaultValue: '',
            attributes: {
                disabled: false,
            },
            fields: [
                {
                    formId: 'asda123',
                    name: 'some name',
                },
            ],
        };

        const expectedResult = {
            id: 'customData.company',
            type: 'some type',
            createDate: 123123123,
            defaultValue: '',
            attributes: { disabled: true },
            fields: [{ formId: 'asda123', name: 'some name' }],
        };
        fixture.detectChanges();
        const returnData = (component as any).disableField(testAppFormField);
        expect(returnData).toEqual(expectedResult);
    });

    it('test getConfiguredFields should call all function', () => {
        jest.spyOn(component as any, 'disableField');
        jest.spyOn(component as any, 'injectInviteDataToField');
        fixture.detectChanges();
        let testAppFormField = {
            id: 'customData.company',
            type: 'some type',
            createDate: 123123123,
            defaultValue: '',
            attributes: {
                disabled: false,
            },
            fields: [
                {
                    formId: 'asda123',
                    name: 'some name',
                },
            ],
        };

        component.userInviteData = {
            customData: {
                company: 'company',
            },
        };

        (component as any).getConfiguredFields([testAppFormField]);
        expect((component as any).disableField).toHaveBeenCalled();
        expect((component as any).injectInviteDataToField).toHaveBeenCalled();
    });

    it('test call submitForm with good request', fakeAsync(() => {
        fixture.detectChanges();
        jest.spyOn((component as any).nativeLoginService, 'signupByInvite');
        jest.spyOn((component as any).logOutService, 'logOut');
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
        expect((component as any).nativeLoginService.signupByInvite).toBeCalled();
        expect((component as any).loaderBar.start).toBeCalled();
        tick();
        expect((component as any).logOutService.logOut).toBeCalled();
        expect(component.inProcess).toBeFalsy();
        expect(component.showSignupFeedbackPage).toBeTruthy();
        expect((component as any).loaderBar.complete).toBeCalled();
    }));

    it('test call submitForm with bad request and trigger error', fakeAsync(() => {
        fixture.detectChanges();
        jest.spyOn((component as any).nativeLoginService, 'signupByInvite');
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

        (component as any).nativeLoginService.signupByInvite = () => throwError('Error');
        component.submitForm(userData);
        tick();
        expect(component.inProcess).toBeFalsy();
        expect(component.showSignupFeedbackPage).toBeFalsy();
        expect((component as any).loaderBar.complete).toBeCalled();
    }));

    it('check trigger submitForm event', fakeAsync(() => {
        fixture.detectChanges();
        const SubmitInvitedSignupComponent = InvitedSignupComponentDE().componentInstance;
        jest.spyOn(component, 'submitForm');
        SubmitInvitedSignupComponent.resultUserData.emit(true);
        tick();
        expect(component.submitForm).toHaveBeenCalled();
    }));

    it('pass all necessary variables to the oc-signup-custom', () => {
        (component as any).isExpired = true;
        (component as any).isExpired = false;
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
        component.formConfigsLoading = true;
        component.showSignupFeedbackPage = true;
        (component as any).formConfigs = OcEditUserFormConfig;
        fixture.detectChanges();
        const resetPasswordInstance = InvitedSignupComponentDE().componentInstance;
        expect(resetPasswordInstance.formConfigs).toEqual(component.formConfigs);
    });
});
