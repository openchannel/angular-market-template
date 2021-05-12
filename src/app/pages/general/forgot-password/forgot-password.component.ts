import { Component, OnDestroy } from '@angular/core';
import { NativeLoginService } from '@openchannel/angular-common-services';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ComponentsUserRegistrationModel } from '@openchannel/angular-common-components';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnDestroy {

    signupUrl = '/signup';
    loginUrl = '/login';
    companyLogoUrl = './assets/img/company-logo-2x.png';
    forgotPasswordDoneIconPath = './assets/img/forgot-password-complete-icon.svg';
    showResultPage = false;
    signIn = new ComponentsUserRegistrationModel();
    inProcess = false;

    private destroy$: Subject<void> = new Subject();

    constructor(private nativeLoginService: NativeLoginService) {
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    resetPwd(event) {
        if (event === true) {
            this.inProcess = true;
            this.nativeLoginService.sendResetCode(this.signIn.email)
                .pipe(takeUntil(this.destroy$))
                .subscribe(res => {
                    this.showResultPage = true;
                    this.inProcess = false;
                }, res => {
                    this.inProcess = false;
                });
        }
    }


}
