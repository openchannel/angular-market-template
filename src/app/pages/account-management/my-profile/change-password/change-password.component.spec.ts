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
import { asyncScheduler, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup } from '@angular/forms';
import { observeOn } from 'rxjs/operators';

describe('ChangePasswordComponent', () => {
    let component: ChangePasswordComponent;
    let fixture: ComponentFixture<ChangePasswordComponent>;

    const fg = new FormGroup({
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
        component.setPasswordFormGroup(fg);
        component.passwordFormGroup.controls.password.setValue('testPassword123');
        fixture.detectChanges();

        jest.resetAllMocks();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return if isSaveInProcess or passwordFormGroup is invalid', () => {
        jest.spyOn(component, 'changePassword');
        component.passwordFormGroup.controls.password.setValue('');
        component.changePassword();
        expect(component.changePassword).toHaveBeenCalled();
        expect(component.passwordFormGroup.valid).toBeFalsy();
        expect(component.isSaveInProcess).toBeFalsy();
    });

    it('should set tokens to localstorage', fakeAsync(() => {
        jest.spyOn((component as any).authHolderService, 'persist');
        component.changePassword();
        tick();
        expect((component as any).authHolderService.persist).toHaveBeenCalled();
        expect(window.localStorage.getItem('accessToken')).toEqual('access');
        expect(window.localStorage.getItem('refreshToken')).toEqual('refresh');
    }));

    it('should call changePassword and throw error', fakeAsync(() => {
        jest.spyOn((component as any).authHolderService, 'persist');
        window.localStorage.setItem('accessToken', 'test1');
        window.localStorage.setItem('refreshToken', 'test2');
        (component as any).nativeLoginService.changePassword = () => throwError('Error').pipe(observeOn(asyncScheduler));
        component.changePassword();
        tick();
        expect(window.localStorage.getItem('accessToken') === 'access').toBeFalsy();
        expect(window.localStorage.getItem('refreshToken') === 'refresh').toBeFalsy();
        expect(component.isSaveInProcess).toBeFalsy();
    }));

    it('should call changePassword and show toaster message', fakeAsync(() => {
        jest.spyOn((component as any).toasterService, 'success');
        component.changePassword();
        tick();
        expect((component as any).toasterService.success).toHaveBeenCalled();
    }));
});
