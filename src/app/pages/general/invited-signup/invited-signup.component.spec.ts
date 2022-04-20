import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { InvitedSignupComponent } from './invited-signup.component';
import {
    mockAuthenticationService,
    mockEditUserTypeService,
    mockInviteUserServiceProvider,
    mockLoadingBarService,
    mockLogOutService,
    mockNativeLoginService,
    mockToastrService,
    mockUserAccountTypesService,
} from '../../../../mock/providers.mock';
import { MockRoutingComponent, MockSignupCustom } from '../../../../mock/components.mock';

import { RouterTestingModule } from '@angular/router/testing';
import { InviteUserService, NativeLoginService, UserAccountTypesService } from '@openchannel/angular-common-services';
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
    let inviteUserService: InviteUserService;
    let toastrService: ToastrService;
    let userAccountTypesService: UserAccountTypesService;
    let nativeLoginService: NativeLoginService;
    let logOutService: LogOutService;

    const tokenValue = '24fkzrw3487943uf358lovd';

    const InvitedSignupComponentDE = () => fixture.debugElement.query(By.directive(MockSignupCustom));
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
                    mockNativeLoginService(),
                    mockLoadingBarService(),
                    mockEditUserTypeService(),
                    mockToastrService(),
                    mockLogOutService(),
                    mockEditUserTypeService(),
                    mockAuthenticationService(),
                    mockUserAccountTypesService(),
                    mockInviteUserServiceProvider(),
                    {
                        provide: ActivatedRoute,
                        useValue: {
                            snapshot: { params: { token: tokenValue } },
                        },
                    },
                ],
            }).compileComponents();
            router = TestBed.inject(Router);
            acivateRoute = TestBed.inject(ActivatedRoute);
            inviteUserService = TestBed.inject(InviteUserService);
            toastrService = TestBed.inject(ToastrService);
            userAccountTypesService = TestBed.inject(UserAccountTypesService);
            nativeLoginService = TestBed.inject(NativeLoginService);
            logOutService = TestBed.inject(LogOutService);
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(InvitedSignupComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should init all necessary data, calling function ngInit and after destroy end all subscribe', () => {
        jest.spyOn(component as any, 'checkSSO');
        jest.spyOn(component, 'getInviteDetails');
        fixture.detectChanges();
        jest.spyOn((component as any).destroy$, 'complete');
        jest.spyOn((component as any).loaderBar, 'complete');

        expect((component as any).checkSSO).toHaveBeenCalled();
        expect(component.getInviteDetails).toHaveBeenCalled();
        fixture.destroy();
        expect((component as any).destroy$.complete).toHaveBeenCalled();
        expect((component as any).loaderBar.complete).toHaveBeenCalled();
    });

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

        jest.spyOn(inviteUserService, 'getUserInviteInfoByToken');
        jest.spyOn(toastrService, 'error');
        jest.spyOn((component as any).loaderBar, 'complete');
        inviteUserService.getUserInviteInfoByToken = () => throwError('Error');
        component.getInviteDetails();
        tick();
        expect((component as any).loaderBar.complete).toBeCalled();
        expect(toastrService.error).toBeCalled();
    }));

    it('test getInviteDetails if good request to  inviteUserService and userInviteData.expireDate is Expired', fakeAsync(() => {
        fixture.detectChanges();
        jest.spyOn(component as any, 'getInviteDetails');
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

        jest.spyOn(inviteUserService, 'getUserInviteInfoByToken').mockReturnValue(of(mockInviteUserModelGoodResponse));
        jest.spyOn(component, 'getFormConfigs');
        jest.spyOn(userAccountTypesService, 'getUserAccountType');
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
        expect(userAccountTypesService.getUserAccountType).toHaveBeenCalled();
        expect((component as any).mapUserAccountTypeToFormConfigs).toHaveBeenCalled();
        expect((component as any).getFormConfigsWithConfiguredFields).toHaveBeenCalled();
        expect((component as any).loaderBar.complete).toHaveBeenCalled();
        expect(component.formConfigsLoading).toBeFalsy();
        expect(memoFormConfigs).not.toEqual(component.formConfigs);

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
        expect((component as any).getFormConfigsWithConfiguredFields(expampleOfReturnOcEditUserFormConfigArray)).toEqual(
            expampleOfReturnOcEditUserFormConfigArray,
        );
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

        expect((component as any).mapUserAccountTypeToFormConfigs(userAccountType)).toEqual(expampleOfReturnOcEditUserFormConfigArray);
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

        expect((component as any).injectInviteDataToField(testAppFormField)).toEqual(exampleDataForCustomData);
    });

    it('should show SignupFeedbackPage and end process if submitForm call with good request', fakeAsync(() => {
        fixture.detectChanges();
        jest.spyOn(nativeLoginService, 'signupByInvite');
        jest.spyOn(logOutService, 'logOut');
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
        expect(logOutService.logOut).toBeCalled();
        expect(component.inProcess).toBeFalsy();
        expect(component.showSignupFeedbackPage).toBeTruthy();
        expect((component as any).loaderBar.complete).toBeCalled();
    }));

    it('should end process if call submitForm with bad request and trigger error', fakeAsync(() => {
        fixture.detectChanges();

        jest.spyOn(nativeLoginService, 'signupByInvite');
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

        nativeLoginService.signupByInvite = () => throwError('Error');
        component.submitForm(userData);
        tick();
        expect(component.inProcess).toBeFalsy();
        expect(component.showSignupFeedbackPage).toBeFalsy();
        expect((component as any).loaderBar.complete).toBeCalled();
    }));

    it('pass all necessary variables to the oc-signup-custom and test resultUserData event', fakeAsync(() => {
        fixture.detectChanges();
        const activateElement = fixture.debugElement.query(By.css('.signup-position'));
        expect(activateElement).toBeTruthy();

        fixture.detectChanges();
        jest.spyOn(component, 'submitForm');

        const ocEditUserFormConfig = {
            name: '',
            account: {
                type: '1312sad123',
                typeData: { ...userAccountType },
                includeFields: ['as1231321123'],
            },
        };
        (component as any).formConfigs = ocEditUserFormConfig;
        fixture.detectChanges();
        const SubmitInvitedSignupComponent = InvitedSignupComponentDE().componentInstance;
        SubmitInvitedSignupComponent.resultUserData.emit(true);
        tick();
        expect(component.submitForm).toHaveBeenCalled();
        expect(InvitedSignupComponentDE().componentInstance.formConfigs).toEqual(component.formConfigs);
    }));
});
