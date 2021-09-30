import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { AuthenticationService, AuthHolderService, SiteAuthConfig } from '@openchannel/angular-common-services';
import { from, Observable } from 'rxjs';
import { first, map, mergeMap, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class LogOutService {
    constructor(
        private oAuthService: OAuthService,
        private authService: AuthHolderService,
        private authenticationService: AuthenticationService,
        private router: Router,
    ) {}

    logOut(): Observable<boolean> {
        return this.authenticationService.getAuthConfig().pipe(
            mergeMap(config => (config ? this.logOutSSO(config) : this.logOutNative())),
            tap(() => this.authService.clearTokensInStorage()),
        );
    }

    logOutAndRedirect(navigateTo: string): void {
        this.authenticationService
            .getAuthConfig()
            .pipe(
                first(),
                mergeMap(config => (config ? this.logOutSSO(config) : this.logOutNative())),
                tap(() => this.authService.clearTokensInStorage()),
            )
            .subscribe(() => this.router.navigateByUrl(navigateTo).then());
    }

    private isAuthorizationCodeFlow(authConfig: SiteAuthConfig): boolean {
        return authConfig.grantType === 'authorization_code' && authConfig.clientAccessType === 'confidential';
    }

    private logOutSSO(ssoConfig: SiteAuthConfig): Observable<boolean> {
        if (this.isAuthorizationCodeFlow(ssoConfig)) {
            return this.authenticationService.logOut().pipe(map(() => true));
        } else {
            this.oAuthService.configure({
                ...ssoConfig,
                postLogoutRedirectUri: window.location.origin,
                strictDiscoveryDocumentValidation: false,
            });
            return from(this.oAuthService.loadDiscoveryDocument()).pipe(
                mergeMap(() => this.authenticationService.logOut().pipe(first())),
                tap(() => this.oAuthService.logOut()),
                map(() => true),
            );
        }
    }

    private logOutNative(): Observable<boolean> {
        return this.authenticationService.logOut().pipe(
            first(),
            map(() => true),
        );
    }
}
