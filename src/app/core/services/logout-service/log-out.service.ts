import {Injectable} from '@angular/core';
import {OAuthService} from 'angular-oauth2-oidc';
import {Router} from '@angular/router';
import {AuthenticationService, AuthHolderService} from '@openchannel/angular-common-services';
import {from, Observable} from 'rxjs';
import {first, flatMap, map, tap} from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class LogOutService {

    constructor(private oAuthService: OAuthService,
                private authService: AuthHolderService,
                private authenticationService: AuthenticationService,
                private router: Router) {
    }

    logOut(): Observable<boolean> {
        return this.authenticationService.getAuthConfig()
        .pipe(
            flatMap(config => config ? this.logOutSSO(config) : this.logOutNative()),
            tap(() => this.authService.clearTokensInStorage()));
    }

    logOutAndRedirect(navigateTo: string): void {
        this.authenticationService.getAuthConfig()
        .pipe(
            flatMap(config => config ? this.logOutSSO(config) : this.logOutNative()),
            tap(() => this.authService.clearTokensInStorage()))
        .subscribe(() => this.router.navigateByUrl(navigateTo).then());
    }

    private logOutSSO(ssoConfig: any): Observable<boolean> {
        this.oAuthService.configure({
            ...ssoConfig,
            postLogoutRedirectUri: window.location.origin,
        });
        return from(this.oAuthService.loadDiscoveryDocument())
        .pipe(
            flatMap(() => this.authenticationService.logOut().pipe(first())),
            tap(() => this.oAuthService.logOut()),
            map(() => true));
    }

    private logOutNative(): Observable<boolean> {
        return this.authenticationService.logOut().pipe(first(), map(() => true));
    }
}
