import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { GeneralProfileComponent } from './general-profile.component';
import {
    MockButtonComponent,
    MockEditUserFormComponent,
    MockEditUserTypeService,
    mockInviteUserAccountServiceProvider,
    MockLoadingBarService,
    MockToastrService,
    MockUserRoleService,
} from '../../../../../mock/mock';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { UserAccount } from '@openchannel/angular-common-services';
import { ToastrService } from 'ngx-toastr';
import { OcEditUserTypeService } from '@core/services/user-type-service/user-type.service';
import { throwError } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { times } from 'lodash';

const userId = 'testUserId';

const mainUserAccount: UserAccount = {
    userAccountId: 'mainUserAccountId',
    userId,
    name: 'mainUserAccount',
    roles: [MockUserRoleService.ADMIN_ROLE_ID],
} as UserAccount;

const userAccounts: UserAccount[] = times(3, index => ({
    userId,
    userAccountId: `userAccountId_${index}`,
    name: `userAccountName_${index}`,
    roles: [MockUserRoleService.ADMIN_ROLE_ID],
}));

describe('MyProfileComponent', () => {
    let component: GeneralProfileComponent;
    let fixture: ComponentFixture<GeneralProfileComponent>;

    const getEditUserFormDE = () => fixture.debugElement.query(By.directive(MockEditUserFormComponent));
    const getSaveButtonDE = () => fixture.debugElement.query(By.directive(MockButtonComponent));

    const makeUserDataBeAbleToSave = () => {
        component.formGroup = { markAllAsTouched: jest.fn() } as unknown as FormGroup;
        component.resultData = { account: { email: 'email' } };
        component.inSaveProcess = false;
    };

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [GeneralProfileComponent, MockEditUserFormComponent, MockButtonComponent],
                providers: [
                    mockInviteUserAccountServiceProvider(mainUserAccount, userAccounts),
                    { provide: LoadingBarService, useClass: MockLoadingBarService },
                    { provide: ToastrService, useClass: MockToastrService },
                    { provide: OcEditUserTypeService, useClass: MockEditUserTypeService },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(GeneralProfileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should complete $destroy and loader in ngOnDestroy hook', () => {
        jest.spyOn((component as any).$destroy, 'complete');
        jest.spyOn((component as any).loader, 'complete');

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnDestroy();

        expect((component as any).$destroy.complete).toHaveBeenCalled();
        expect((component as any).loader.complete).toHaveBeenCalled();
    });

    it('should init loader in ngOnInit hook', () => {
        (component as any).loader = null;

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnInit();

        expect((component as any).loader).not.toBeNull();
    });

    it('should call initDefaultFormConfig in ngOnInit hook', () => {
        jest.spyOn(component as any, 'initDefaultFormConfig');

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnInit();

        expect((component as any).initDefaultFormConfig).toHaveBeenCalled();
    });

    it('should call accountService.getUserAccount in initDefaultFormConfig method', () => {
        jest.spyOn((component as any).accountService, 'getUserAccount');

        (component as any).initDefaultFormConfig();

        expect((component as any).accountService.getUserAccount).toHaveBeenCalled();
    });

    it('should call accountService.injectTypeDataIntoConfigs with correct data in initDefaultFormConfig method', () => {
        jest.spyOn((component as any).ocTypeService, 'injectTypeDataIntoConfigs');

        (component as any).initDefaultFormConfig();

        expect((component as any).ocTypeService.injectTypeDataIntoConfigs).toHaveBeenCalledWith(
            (component as any).formConfigsWithoutTypeData,
            false,
            true,
        );
    });

    it('should start loader in initDefaultFormConfig method', () => {
        jest.spyOn((component as any).loader, 'start');

        (component as any).initDefaultFormConfig();

        expect((component as any).loader.start).toHaveBeenCalled();
    });

    it('should complete loader when account request and inject request complete in initDefaultFormConfig method', fakeAsync(() => {
        jest.spyOn((component as any).loader, 'complete');

        (component as any).initDefaultFormConfig();
        tick();

        expect((component as any).loader.complete).toHaveBeenCalled();
    }));

    it('should complete loader when account request errors in initDefaultFormConfig method', fakeAsync(() => {
        jest.spyOn((component as any).loader, 'complete');
        (component as any).accountService.getUserAccount = () => throwError('Error');

        try {
            (component as any).initDefaultFormConfig();
            tick();
        } catch {}

        expect((component as any).loader.complete).toHaveBeenCalled();
    }));

    it('should complete loader when inject request errors in initDefaultFormConfig method', fakeAsync(() => {
        jest.spyOn((component as any).loader, 'complete');
        (component as any).ocTypeService.injectTypeDataIntoConfigs = () => throwError('Error');

        try {
            (component as any).initDefaultFormConfig();
            tick();
        } catch {}

        expect((component as any).loader.complete).toHaveBeenCalled();
    }));

    it('should set formConfigsLoaded=true when account request and inject request complete successfully', fakeAsync(() => {
        component.formConfigsLoaded = false;

        (component as any).initDefaultFormConfig();
        tick();

        expect(component.formConfigsLoaded).toBeTruthy();
    }));

    it('should correctly set formAccountData and formConfigs when account request and inject request complete successfully', fakeAsync(() => {
        component.formAccountData = null;
        component.formConfigs = null;

        (component as any).initDefaultFormConfig();
        tick();

        expect(component.formAccountData).toEqual(mainUserAccount);
        expect(component.formConfigs).toEqual(MockEditUserTypeService.MOCK_FORM_CONFIGS_RESPONSE);
    }));

    it('saveUserData method should call formGroup.markAllAsTouched method before the save processing', () => {
        makeUserDataBeAbleToSave();

        component.saveUserData();

        expect(component.formGroup.markAllAsTouched).toHaveBeenCalled();
    });

    it('should call accountService.updateUserAccount if inSaveProcess=false and accountData exist', () => {
        jest.spyOn((component as any).accountService, 'updateUserAccount');
        makeUserDataBeAbleToSave();

        component.saveUserData();

        expect((component as any).accountService.updateUserAccount).toHaveBeenCalled();
    });

    it('should not call accountService.updateUserAccount if inSaveProcess=true', () => {
        jest.spyOn((component as any).accountService, 'updateUserAccount');
        makeUserDataBeAbleToSave();
        component.inSaveProcess = true;

        component.saveUserData();

        expect((component as any).accountService.updateUserAccount).not.toHaveBeenCalled();
    });

    it('should not call accountService.updateUserAccount if accountData doesnt exist', () => {
        jest.spyOn((component as any).accountService, 'updateUserAccount');
        makeUserDataBeAbleToSave();
        component.resultData.account = null;

        component.saveUserData();

        expect((component as any).accountService.updateUserAccount).not.toHaveBeenCalled();
    });

    it('should start loader and set inSaveProcess=true before updating account in saveUserData method', () => {
        jest.spyOn((component as any).loader, 'start');
        makeUserDataBeAbleToSave();

        component.saveUserData();

        expect((component as any).loader.start).toHaveBeenCalled();
        expect(component.inSaveProcess).toBeTruthy();
    });

    it('should call accountService.updateUserAccount with account data', () => {
        jest.spyOn((component as any).accountService, 'updateUserAccount');
        makeUserDataBeAbleToSave();

        component.saveUserData();

        expect((component as any).accountService.updateUserAccount).toHaveBeenCalledWith(component.resultData.account);
    });

    it('should set inSaveProcess=false and complete loader when accountService.updateUserAccount completes successfully', fakeAsync(() => {
        jest.spyOn((component as any).loader, 'complete');
        makeUserDataBeAbleToSave();

        component.saveUserData();
        tick();

        expect((component as any).loader.complete).toHaveBeenCalled();
        expect(component.inSaveProcess).toBeFalsy();
    }));

    it('should set inSaveProcess=false and complete loader when accountService.updateUserAccount errors', fakeAsync(() => {
        jest.spyOn((component as any).loader, 'complete');
        (component as any).accountService.updateUserAccount = () => throwError('Error');
        makeUserDataBeAbleToSave();

        try {
            component.saveUserData();
            tick();
        } catch {}

        expect((component as any).loader.complete).toHaveBeenCalled();
        expect(component.inSaveProcess).toBeFalsy();
    }));

    it('should show toaster message when accountService.updateUserAccount completes successfully', fakeAsync(() => {
        jest.spyOn((component as any).toasterService, 'success');
        makeUserDataBeAbleToSave();

        component.saveUserData();
        tick();

        expect((component as any).toasterService.success).toHaveBeenCalled();
    }));

    it('should render edit-user-form only when form configs have loaded', () => {
        component.formConfigsLoaded = false;
        fixture.detectChanges();
        expect(getEditUserFormDE()).toBeNull();

        component.formConfigsLoaded = true;
        fixture.detectChanges();
        expect(getEditUserFormDE()).not.toBeNull();
    });

    it('should set formGroup when edit-user-form emits createdFormGroup', () => {
        const formGroup = { someKey: 'someValue' };

        component.formGroup = null;
        component.formConfigsLoaded = true;
        fixture.detectChanges();

        getEditUserFormDE().triggerEventHandler('createdFormGroup', formGroup);

        expect(component.formGroup).toEqual(formGroup);
    });

    it('should set resultData when edit-user-form emits resultFormDataChange', () => {
        const resultData = { someKey: 'someValue' };

        component.resultData = null;
        component.formConfigsLoaded = true;
        fixture.detectChanges();

        getEditUserFormDE().triggerEventHandler('resultFormDataChange', resultData);

        expect(component.resultData).toEqual(resultData);
    });

    it('should pass all necessary bindings to the oc-edit-user-form', () => {
        const editUserFormInstance = getEditUserFormDE().componentInstance;

        expect(editUserFormInstance.formConfigs).toEqual(component.formConfigs);
        expect(editUserFormInstance.defaultAccountData).toEqual(component.formAccountData);
        expect(editUserFormInstance.enableTypesDropdown).toBeTruthy();
    });

    it('should render save button only when form configs have loaded', () => {
        component.formConfigsLoaded = false;
        fixture.detectChanges();
        expect(getSaveButtonDE()).toBeNull();

        component.formConfigsLoaded = true;
        fixture.detectChanges();
        expect(getSaveButtonDE()).not.toBeNull();
    });

    it('should call saveUserData method on button click', () => {
        component.saveUserData = jest.fn();
        component.formConfigsLoaded = true;
        fixture.detectChanges();

        getSaveButtonDE().triggerEventHandler('click', {});

        expect(component.saveUserData).toHaveBeenCalled();
    });

    it('should pass inSaveProcess to the process save button binding', () => {
        component.formConfigsLoaded = true;
        fixture.detectChanges();

        const saveButtonInstance = getSaveButtonDE().componentInstance;

        component.inSaveProcess = false;
        fixture.detectChanges();
        expect(saveButtonInstance.process).toBeFalsy();

        component.inSaveProcess = true;
        fixture.detectChanges();
        expect(saveButtonInstance.process).toBeTruthy();
    });
});
