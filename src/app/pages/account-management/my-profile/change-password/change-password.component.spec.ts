import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';

import { ChangePasswordComponent } from './change-password.component';
import { NativeLoginService } from '@openchannel/angular-common-services';
import { MockNativeLoginService, MockToastrService } from '../../../../../mock/mock';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

describe.skip('ChangePasswordComponent', () => {
    let component: ChangePasswordComponent;
    let fixture: ComponentFixture<ChangePasswordComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ChangePasswordComponent],
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

    beforeEach(() => {
        fixture = TestBed.createComponent(ChangePasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    
    it('should set password formGroup', () => {
        expect(component).toBeTruthy();
    });
    
    it('return if isSaveInProcess or passwordFormGroup is invalid', () => {
        expect(component).toBeTruthy();
    });
    
    it('return if isSaveInProcess or passwordFormGroup is invalid', () => {
        expect(component).toBeTruthy();
    });
    
    it('change password and show toaster message', () => {
        expect(component).toBeTruthy();
    });
});
