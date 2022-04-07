import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';

import { ChangePasswordComponent } from './change-password.component';
import { AuthHolderService, NativeLoginService } from '@openchannel/angular-common-services';
import {
    MockAuthHolderService,
    MockButtonComponent,
    MockFormComponent,
    MockNativeLoginService,
    MockToastrService,
} from '../../../../../mock/mock';
import { asyncScheduler, of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup } from '@angular/forms';
import { observeOn } from 'rxjs/operators';
import { By } from '@angular/platform-browser';

describe('ChangePasswordComponent', () => {
    let component: ChangePasswordComponent;
    let fixture: ComponentFixture<ChangePasswordComponent>;

    const getOcButtonDE = () => fixture.debugElement.query(By.directive(MockButtonComponent));
    const getFormDE = () => fixture.debugElement.query(By.directive(MockFormComponent));

    const formGroup = new FormGroup({
        password: new FormControl(),
    });

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ChangePasswordComponent, MockButtonComponent, MockFormComponent],
                providers: [
                    { provide: NativeLoginService, useClass: MockNativeLoginService },
                    { provide: AuthHolderService, useClass: MockAuthHolderService },
                    { provide: ToastrService, useClass: MockToastrService },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ChangePasswordComponent);
        component = fixture.componentInstance;
        component.setPasswordFormGroup(formGroup);
        component.passwordFormGroup.controls.password.setValue('testPassword123');
        fixture.detectChanges();

        jest.resetAllMocks();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should pass config to mockFormComponent', () => {
        component.formPasswordDefinition = {
            fields: [
                {
                    id: 'password',
                    label: 'Current Password Test',
                    type: 'password',
                    attributes: {},
                },
                {
                    id: 'newPassword',
                    label: 'New Password Test',
                    type: 'password',
                    attributes: {
                        required: true,
                    },
                },
            ],
        };
        fixture.detectChanges();
        const formComponentMock = getFormDE().componentInstance;
        expect(formComponentMock.formJsonData).toEqual(component.formPasswordDefinition);
    });

    it('should call emitter for CreatedForm output', () => {
        jest.spyOn(component, 'setPasswordFormGroup');
        const formComponentMock = getFormDE().componentInstance;
        formComponentMock.createdForm.emit(formGroup);
        component.passwordFormGroup.controls.password.setValue('');
        expect(component.setPasswordFormGroup).toHaveBeenCalled();
        expect(component.passwordFormGroup.controls.password.errors).toEqual({ required: true });
    });

    it('should return if isSaveInProcess or passwordFormGroup is invalid', () => {
        jest.spyOn(component, 'changePassword');
        component.passwordFormGroup.controls.password.setValue('');
        const ocButtonMock = getOcButtonDE().componentInstance;
        ocButtonMock.click.emit();
        expect(component.passwordFormGroup.valid).toBeFalsy();
        expect(component.isSaveInProcess).toBeFalsy();
    });

    it('should set tokens to localstorage', fakeAsync(() => {
        jest.spyOn((component as any).authHolderService, 'persist');
        (component as any).nativeLoginService.changePassword = jest.fn().mockReturnValue(
            of({
                refreshToken: 'refreshToken123',
                accessToken: 'accessToken123',
            }),
        );
        const ocButtonMock = getOcButtonDE().componentInstance;
        ocButtonMock.click.emit();
        tick();
        expect((component as any).authHolderService.persist).toHaveBeenCalledWith('accessToken123', 'refreshToken123');
    }));

    it('should call changePassword and throw error', fakeAsync(() => {
        jest.spyOn((component as any).authHolderService, 'persist');
        window.localStorage.setItem('accessToken', 'test1');
        window.localStorage.setItem('refreshToken', 'test2');
        (component as any).nativeLoginService.changePassword = () => throwError('Error').pipe(observeOn(asyncScheduler));
        const ocButtonMock = getOcButtonDE().componentInstance;
        ocButtonMock.click.emit();
        tick();
        expect(window.localStorage.getItem('accessToken') === 'access').toBeFalsy();
        expect(window.localStorage.getItem('refreshToken') === 'refresh').toBeFalsy();
        expect(component.isSaveInProcess).toBeFalsy();
    }));

    it('should call changePassword and show toaster message', fakeAsync(() => {
        jest.spyOn((component as any).toasterService, 'success');
        const ocButtonMock = getOcButtonDE().componentInstance;
        ocButtonMock.click.emit();
        tick();
        expect((component as any).toasterService.success).toHaveBeenCalled();
    }));
});
