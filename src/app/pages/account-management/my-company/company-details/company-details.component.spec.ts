import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { CompanyDetailsComponent } from './company-details.component';

import { UserCompanyModel } from '@openchannel/angular-common-services';
import { FormGroup } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { MockTypeMapperUtils, MockUsersService } from '../../../../../mock/services.mock';
import { MockButtonComponent, MockFormComponent } from '../../../../../mock/components.mock';
import { MockPermissionDirective } from '../../../../../mock/directives.mock';
import { mockLoadingBarService, mockToastrService, mockUserServiceProvider } from '../../../../../mock/providers.mock';

jest.doMock('@openchannel/angular-common-services', () => ({
    ...jest.requireActual('@openchannel/angular-common-services'),
    TypeMapperUtils: MockTypeMapperUtils,
}));

describe('CompanyDetailsComponent', () => {
    let component: CompanyDetailsComponent;
    let fixture: ComponentFixture<CompanyDetailsComponent>;

    const makeOrganizationAbleToBeSaved = () => {
        (component as any).organizationForm = { valid: true, markAllAsTouched: jest.fn() };
        (component as any).organizationResult = {};
        component.inProcess = false;
    };

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [CompanyDetailsComponent, MockFormComponent, MockButtonComponent, MockPermissionDirective],
                providers: [mockLoadingBarService(), mockToastrService(), mockUserServiceProvider()],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyDetailsComponent);
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

    it('should set formConfig in createFormFields method', () => {
        component.formConfig = null;
        (component as any).createFormFields({}, {} as UserCompanyModel);

        expect(component.formConfig).not.toBeNull();
    });

    it('should complete loader in createFormFields method', () => {
        jest.spyOn((component as any).loader, 'complete');
        (component as any).createFormFields({}, {} as UserCompanyModel);

        expect((component as any).loader.complete).toHaveBeenCalled();
    });

    it('should call createFormFields method with default config if user company does not have type', fakeAsync(() => {
        (component as any).usersService.getUserCompany = () =>
            of({
                ...MockUsersService.MOCK_USER_COMPANY_RESPONSE,
                type: null,
            });
        jest.spyOn(component as any, 'createFormFields');

        component.initCompanyForm();
        tick();

        expect((component as any).createFormFields).toHaveBeenCalledWith((component as any).defaultFormConfig, expect.anything());
    }));

    it('should call createFormFields method with default config if request for user type definition has thrown error', fakeAsync(() => {
        (component as any).usersService.getUserTypeDefinition = () => throwError('Error');
        jest.spyOn(component as any, 'createFormFields');

        component.initCompanyForm();
        tick();

        expect((component as any).createFormFields).toHaveBeenCalledWith((component as any).defaultFormConfig, expect.anything());
    }));

    it('should complete loader and show toaster error if request for user company has thrown error', fakeAsync(() => {
        (component as any).usersService.getUserCompany = () => throwError('Error');
        jest.spyOn((component as any).loader, 'complete');
        jest.spyOn((component as any).toastService, 'error');

        component.initCompanyForm();
        tick();

        expect((component as any).loader.complete).toHaveBeenCalled();
        expect((component as any).toastService.error).toHaveBeenCalled();
    }));

    it('should call createFormFields method with fetched type if user company has type and request for this type was successful', fakeAsync(() => {
        jest.spyOn(component as any, 'createFormFields');

        component.initCompanyForm();
        tick();

        expect((component as any).createFormFields).toHaveBeenCalledWith(
            MockUsersService.MOCK_USER_TYPE_DEFINITION_RESPONSE,
            expect.anything(),
        );
    }));

    it('should set organizationForm in setCreatedForm method', () => {
        const newForm = {} as FormGroup;

        (component as any).organizationForm = null;
        component.setCreatedForm(newForm);

        expect((component as any).organizationForm).toEqual(newForm);
    });

    it('should set organizationResult in setResultData method', () => {
        const newResult = {};

        (component as any).organizationResult = null;
        component.setResultData(newResult);

        expect((component as any).organizationResult).toEqual(newResult);
    });

    it('usersService.updateUserCompany in saveOrganization method should not be called if organizationForm is invalid', () => {
        jest.spyOn((component as any).usersService, 'updateUserCompany');

        makeOrganizationAbleToBeSaved();
        (component as any).organizationForm.valid = false;

        component.saveOrganization();

        expect((component as any).usersService.updateUserCompany).not.toHaveBeenCalled();
    });

    it('usersService.updateUserCompany in saveOrganization method should not be called if organizationResult does not exist', () => {
        jest.spyOn((component as any).usersService, 'updateUserCompany');

        makeOrganizationAbleToBeSaved();
        (component as any).organizationResult = null;

        component.saveOrganization();

        expect((component as any).usersService.updateUserCompany).not.toHaveBeenCalled();
    });

    it('usersService.updateUserCompany in saveOrganization method should not be called if inProcess is true', () => {
        jest.spyOn((component as any).usersService, 'updateUserCompany');

        makeOrganizationAbleToBeSaved();
        component.inProcess = true;

        component.saveOrganization();

        expect((component as any).usersService.updateUserCompany).not.toHaveBeenCalled();
    });

    it('should set inProcess to true if user organization can be saved', () => {
        makeOrganizationAbleToBeSaved();

        component.saveOrganization();

        expect(component.inProcess).toBeTruthy();
    });

    it('should set inProcess to false when usersService.updateUserCompany completes', fakeAsync(() => {
        makeOrganizationAbleToBeSaved();

        component.saveOrganization();
        tick();

        expect(component.inProcess).toBeFalsy();
    }));

    it('should show success message when usersService.updateUserCompany completes successfully', fakeAsync(() => {
        jest.spyOn((component as any).toastService, 'success');
        makeOrganizationAbleToBeSaved();

        component.saveOrganization();
        tick();

        expect((component as any).toastService.success).toHaveBeenCalled();
    }));

    it('should show error message when usersService.updateUserCompany throws error', fakeAsync(() => {
        jest.spyOn((component as any).toastService, 'error');
        makeOrganizationAbleToBeSaved();
        (component as any).usersService.updateUserCompany = () => throwError('Error');

        try {
            component.saveOrganization();
            tick();
        } catch {}

        expect((component as any).toastService.error).toHaveBeenCalled();
    }));

    it('should render company content if formConfig.fields exist', () => {
        component.formConfig.fields = [];
        fixture.detectChanges();

        const companyContent = fixture.debugElement.query(By.css('.company-container'));
        expect(companyContent).not.toBeNull();
    });

    it('should not render company content if formConfig.fields does not exist', () => {
        component.formConfig.fields = null;
        fixture.detectChanges();

        const companyContent = fixture.debugElement.query(By.css('.company-container'));
        expect(companyContent).toBeNull();
    });

    it('should call setCreatedForm method when oc-form emits createdForm', () => {
        jest.spyOn(component, 'setCreatedForm');

        component.formConfig.fields = [];
        fixture.detectChanges();

        const formDE = fixture.debugElement.query(By.directive(MockFormComponent));
        formDE.triggerEventHandler('createdForm', {});

        expect(component.setCreatedForm).toHaveBeenCalled();
    });

    it('should call setResultData method when oc-form emits formDataUpdated', () => {
        jest.spyOn(component, 'setResultData');

        component.formConfig.fields = [];
        fixture.detectChanges();

        const formDE = fixture.debugElement.query(By.directive(MockFormComponent));
        formDE.triggerEventHandler('formDataUpdated', {});

        expect(component.setResultData).toHaveBeenCalled();
    });

    it('should pass process to oc-button', () => {
        component.formConfig.fields = [];
        component.inProcess = false;
        fixture.detectChanges();

        const buttonInstance = fixture.debugElement.query(By.directive(MockButtonComponent)).componentInstance;
        expect(buttonInstance.process).toBe(component.inProcess);

        component.inProcess = true;
        fixture.detectChanges();

        expect(buttonInstance.process).toBe(component.inProcess);
    });

    it('should call saveOrganization method on oc-button click', () => {
        component.saveOrganization = jest.fn();

        component.formConfig.fields = [];
        fixture.detectChanges();

        const buttonElement = fixture.debugElement.query(By.directive(MockButtonComponent)).nativeElement;
        buttonElement.click();

        expect(component.saveOrganization).toHaveBeenCalled();
    });
});
