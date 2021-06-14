import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccessLevel, AuthenticationService, AuthHolderService, Permission, PermissionType } from '@openchannel/angular-common-services';
import { LogOutService } from '@core/services/logout-service/log-out.service';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
    isSSO: any;
    isSsoConfigExist = true;
    isCollapsed = true;
    isMenuCollapsed = true;

    readonly companyPermissions: Permission[] = [
        {
            type: PermissionType.ORGANIZATIONS,
            access: [AccessLevel.MODIFY, AccessLevel.READ],
        },
        {
            type: PermissionType.ACCOUNTS,
            access: [AccessLevel.MODIFY, AccessLevel.READ],
        },
    ];

    private destroy$: Subject<void> = new Subject();

    constructor(
        public router: Router,
        public authHolderService: AuthHolderService,
        private openIdAuthService: AuthenticationService,
        private logOut: LogOutService,
        private activatedRoute: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.isSSO = this.authHolderService?.userDetails?.isSSO;

        this.openIdAuthService
            .getAuthConfig()
            .pipe(
                takeUntil(this.destroy$),
                map(value => !!value),
            )
            .subscribe(authConfigExistence => (this.isSsoConfigExist = authConfigExistence));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    logout(): void {
        this.logOut.logOutAndRedirect('/');
    }

    closedMenu(): void {
        this.isMenuCollapsed = true;
        this.isCollapsed = true;
    }

    checkIncludesUrl(url1, url2?): boolean {
        return this.router.url.includes(url1) || (url2 && this.router.url.includes(url2));
    }

    getUrlWithoutFragment(): string {
        let routerPath = this.router.url;
        if (this.activatedRoute.snapshot.fragment) {
            routerPath = routerPath.split('#')[0];
        }
        return routerPath;
    }
}
