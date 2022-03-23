import { Component, OnDestroy } from '@angular/core';
import { NativeLoginService } from '@openchannel/angular-common-services';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ComponentsUserActivationModel } from '@openchannel/angular-common-components';

@Component({
    selector: 'app-activation',
    templateUrl: './activation.component.html',
    styleUrls: ['./activation.component.scss'],
})
export class ActivationComponent implements OnDestroy {
    companyLogoUrl = './assets/img/company-logo-2x.png';
    signupUrl = '/signup';
    activationUrl = '';
    inProcess = false;

    testBool = false;

    activationModel = new ComponentsUserActivationModel();

    private destroy$: Subject<void> = new Subject();

    constructor(
        private nativeLoginService: NativeLoginService,
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService,
    ) {
        this.activationModel.code = this.route.snapshot.queryParamMap.get('token');
    }

    activate(event: boolean): void {
        if (event === true && !this.inProcess) {
            this.inProcess = true;
            this.nativeLoginService
                .activate(this.activationModel.code)
                .pipe(takeUntil(this.destroy$))
                .subscribe(
                    res => {
                        this.inProcess = false;
                        this.testBool = true;
                        this.toastr.success('Account successfully activated!');
                        this.router.navigate(['login']);
                    },
                    error => {
                        this.inProcess = false;
                    },
                );
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
