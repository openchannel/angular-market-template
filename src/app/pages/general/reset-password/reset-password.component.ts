import {Component, OnDestroy, OnInit} from '@angular/core';
import {NativeLoginService, UserResetPassword} from 'oc-ng-common-service';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit, OnDestroy {

    companyLogoUrl = './assets/img/company-logo-2x.png';
    inProcess = false;
    resetModel = new UserResetPassword();

    private destroy$: Subject<void> = new Subject();

    constructor(private nativeLoginService: NativeLoginService,
                private router: Router,
                private route: ActivatedRoute) {
        this.resetModel.code = this.route.snapshot.queryParamMap.get('token');
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    reset(event) {
        if (event === true) {
            this.inProcess = true;
            this.nativeLoginService.resetPassword(this.resetModel)
                .pipe(takeUntil(this.destroy$))
                .subscribe(res => {
                    this.inProcess = false;
                    this.router.navigate(['login']);
                    },
                error => {
                    this.inProcess = false;
                },
            );
        }
    }

}
