import {Component, OnDestroy, OnInit} from '@angular/core';
import {SellerSignin, UsersService} from 'oc-ng-common-service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['../../login/login.component.scss'],
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {

    signupUrl = '/signup';
    loginUrl = '/login';
    companyLogoUrl = './assets/img/logo-company.png';
    forgotPasswordDoneIconPath = './assets/img/forgot-password-complete-icon.svg';
    showResultPage = false;
    signIn = new SellerSignin();
    inProcess = false;

    private destroy$: Subject<void> = new Subject();

    constructor(private userService: UsersService) {
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
            this.userService.resetForgotPassword(this.signIn.email)
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
