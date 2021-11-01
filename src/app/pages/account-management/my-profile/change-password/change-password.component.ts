import { Component, OnDestroy } from '@angular/core';
import { AuthHolderService, NativeLoginService } from '@openchannel/angular-common-services';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnDestroy {
    isSaveInProcess = false;

    formPasswordDefinition = {
        fields: [
            {
                id: 'password',
                label: 'Current Password',
                type: 'password',
                attributes: {},
            },
            {
                id: 'newPassword',
                label: 'New Password',
                type: 'password',
                attributes: {
                    required: true,
                },
            },
        ],
    };

    passwordFormGroup: FormGroup;

    private destroy$: Subject<void> = new Subject<void>();

    constructor(
        private toasterService: ToastrService,
        private nativeLoginService: NativeLoginService,
        private authHolderService: AuthHolderService,
    ) {}

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    changePassword(): void {
        if (this.passwordFormGroup) {
            this.passwordFormGroup.markAllAsTouched();
        }
        if (this.isSaveInProcess || this.passwordFormGroup?.invalid) {
            return;
        }
        this.isSaveInProcess = true;
        this.nativeLoginService
            .changePassword({
                ...this.passwordFormGroup.value,
                jwtRefreshToken: this.authHolderService.refreshToken,
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                response => {
                    // set new access and refresh tokens
                    this.authHolderService.persist(response.accessToken, response.refreshToken);
                    for (const controlKey of Object.keys(this.passwordFormGroup.controls)) {
                        const control = this.passwordFormGroup.controls[controlKey];
                        control.reset();
                        control.setErrors(null);
                    }
                    this.toasterService.success('Password has been updated');
                },
                () => {
                    this.isSaveInProcess = false;
                },
                () => {
                    this.isSaveInProcess = false;
                },
            );
    }

    setPasswordFormGroup(passwordGroup: FormGroup): void {
        this.passwordFormGroup = passwordGroup;
        // clear password validator for current user password
        this.passwordFormGroup.controls.password.clearValidators();
        this.passwordFormGroup.controls.password.setValidators(Validators.required);
        this.passwordFormGroup.controls.password.updateValueAndValidity();
    }
}
