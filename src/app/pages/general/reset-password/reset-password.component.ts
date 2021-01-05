import {Component, OnDestroy, OnInit} from '@angular/core';
import {SellerResetPassword, UsersService} from 'oc-ng-common-service';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit, OnDestroy {

    companyLogoUrl = './assets/img/logo-company.png';
    inProcess = false;
    resetModel = new SellerResetPassword();

    private destroy$: Subject<void> = new Subject();

    constructor(private usersService: UsersService,
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
            this.usersService.recoverPassword(this.resetModel)
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
