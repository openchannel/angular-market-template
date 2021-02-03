import {Injectable} from '@angular/core';
import {first} from 'rxjs/operators';
import {OAuthService} from 'angular-oauth2-oidc';
import {Router} from '@angular/router';
import {AuthenticationService, AuthHolderService} from 'oc-ng-common-service';

@Injectable({
    providedIn: 'root',
})
export class LogOutService {

    constructor(private oAuthService: OAuthService,
                private authService: AuthHolderService,
                private authenticationService: AuthenticationService,
                private router: Router) {
    }

    logOut(): void {
        this.authenticationService.getAuthConfig()
            .pipe(first())
            .subscribe(config => {
                if (config) {
                    this.oAuthService.configure({
                        ...config,
                        postLogoutRedirectUri: window.location.origin,
                    });
                    this.oAuthService.loadDiscoveryDocument().then(value => {
                        this.authenticationService.logOut()
                            .pipe(first())
                            .subscribe(() => {
                                this.authService.clearTokensInStorage();
                                this.oAuthService.logOut();
                            });
                    });
                } else {
                    this.nativeLogOut();
                }
            }, error => this.nativeLogOut());
    }

    private nativeLogOut(): void {
        this.authenticationService.logOut()
            .pipe(first())
            .subscribe(() => {
                this.authService.clearTokensInStorage();
                this.router.navigateByUrl('/');
            });
    }
}
