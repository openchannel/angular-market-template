import {Component, OnDestroy, OnInit} from '@angular/core';
import {NativeLoginService, UserRegistrationModel} from 'oc-ng-common-service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {

    signupUrl = '/signup';
    loginUrl = '/login';
    companyLogoUrl = './assets/img/logo-company.png';
    forgotPasswordDoneIconPath = './assets/img/forgot-password-complete-icon.svg';
    showResultPage = false;
    signIn = new UserRegistrationModel();
    inProcess = false;

    private destroy$: Subject<void> = new Subject();

    constructor(private nativeLoginService: NativeLoginService) {
    }

    ngOnInit(): void {
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
