import {Component, OnDestroy} from '@angular/core';
import {SellerActivation, UsersService} from 'oc-ng-common-service';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-activation',
    templateUrl: './activation.component.html',
    styleUrls: ['./activation.component.scss'],
})
export class ActivationComponent implements OnDestroy {

    companyLogoUrl = './assets/img/logo-company.png';
    signupUrl = '/signup';
    activationUrl = '';
    inProcess = false;

    activationModel = new SellerActivation();

    private destroy$: Subject<void> = new Subject();

    constructor(private userService: UsersService,
                private router: Router,
                private route: ActivatedRoute) {
        this.activationModel.code = this.route.snapshot.queryParamMap.get('token');
    }

    activate(event) {
        if (event === true) {
            this.inProcess = true;
            this.userService.emailVerification(this.activationModel.code)
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

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

}
