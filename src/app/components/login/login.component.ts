import {Component, OnDestroy, OnInit} from '@angular/core';
import {
    AuthenticationService,
    AuthHolderService,
    AwsAuthService,
    LoginRequest,
    LoginResponse,
    SellerSignin,
} from 'oc-ng-common-service';
import {Router} from '@angular/router';
import {LoaderService} from 'src/app/shared/services/loader.service';
import {filter, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {OAuthService} from 'angular-oauth2-oidc';
import {JwksValidationHandler} from 'angular-oauth2-oidc-jwks';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {

    companyLogoUrl = './assets/img/logo-company.png';
    signupUrl = '/signup';
    forgotPwdUrl = '/forgot-password';
    signIn = new SellerSignin();
    inProcess = false;
    isLoading = false;

    loginType: string;

    private destroy$: Subject<void> = new Subject();

    constructor(private router: Router,
                private loaderService: LoaderService,
                private awsAuthService: AwsAuthService,
                private authHolderService: AuthHolderService,
                private oauthService: OAuthService,
                private openIdAuthService: AuthenticationService) {
    }

    ngOnInit(): void {
        if (this.authHolderService.isLoggedInUser()) {
            this.router.navigate(['/app-store']);
        }

        this.isLoading = true;
        this.oauthService.hasValidAccessToken();

        this.openIdAuthService.getAuthConfig()
            .pipe(
                takeUntil(this.destroy$),
                filter(value => value))
            .subscribe((authConfig) => {
                    this.loginType = authConfig.type;

                    this.oauthService.configure({
                        ...authConfig,
                        redirectUri: authConfig.redirectUri || window.location.origin,
                    });

                    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
                    this.oauthService.loadDiscoveryDocumentAndTryLogin({
                        onTokenReceived: receivedTokens => {
                            this.openIdAuthService.login(new LoginRequest(receivedTokens.idToken, receivedTokens.accessToken))
                                .pipe(takeUntil(this.destroy$))
                                .subscribe((response: LoginResponse) => {
                                    this.processLoginResponse(response);
                                });
                        },
                    });
                }, err => console.error('getAuthConfig', err),
                () => this.isLoading = false);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    login(event) {
        if (event === true) {
            if (this.loginType) {
                this.oauthService.initLoginFlow();
            } else {
                this.awsAuthService.signIn(this.signIn)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe((response: LoginResponse) => {
                        this.processLoginResponse(response);
                    });
            }

        }
    }

    private processLoginResponse(response: LoginResponse) {
        this.authHolderService.persist(response.accessToken, response.refreshToken);
        localStorage.setItem('email', this.signIn.email);
        this.router.navigate(['/app-store']);
    }
}
