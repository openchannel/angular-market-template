import {Component, OnDestroy, OnInit} from '@angular/core';
import {
    AuthenticationService,
    AuthHolderService,
    AwsAuthService,
    LoginRequest,
    LoginResponse,
    SellerSignin, UsersService,
} from 'oc-ng-common-service';
import {Router} from '@angular/router';
import {filter, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {OAuthService} from 'angular-oauth2-oidc';
import {JwksValidationHandler} from 'angular-oauth2-oidc-jwks';
import {ToastrService} from 'ngx-toastr';
import {LoaderService} from '@core/services/loader.service';

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

    constructor(public loaderService: LoaderService,
                private router: Router,
                private awsAuthService: AwsAuthService,
                private authHolderService: AuthHolderService,
                private oauthService: OAuthService,
                private openIdAuthService: AuthenticationService,
                private usersService: UsersService,
                private toastService: ToastrService) {
    }

    ngOnInit(): void {
        if (this.authHolderService.isLoggedInUser()) {
            this.router.navigate(['app-store']);
        }

        if (this.oauthService.hasValidIdToken()) {
            this.oauthService.logOut();
        }

        this.loaderService.showLoader('getAuthConfig');

        this.openIdAuthService.getAuthConfig()
          .pipe(
            takeUntil(this.destroy$),
            filter(value => value))
          .subscribe((authConfig) => {
                this.loginType = authConfig.type;

                this.oauthService.configure({
                    ...authConfig,
                    redirectUri: authConfig.redirectUri || window.location.href,
                });

                this.oauthService.tokenValidationHandler = new JwksValidationHandler();
                this.oauthService.loadDiscoveryDocumentAndLogin({
                    onTokenReceived: receivedTokens => {
                        this.loaderService.showLoader('internalLogin');
                        this.openIdAuthService.login(new LoginRequest(receivedTokens.idToken, receivedTokens.accessToken))
                          .pipe(takeUntil(this.destroy$))
                          .subscribe((response: LoginResponse) => {
                              this.processLoginResponse(response);
                              this.loaderService.closeLoader('internalLogin');
                          });
                    },
                }).then(() => {
                    this.loaderService.closeLoader('getAuthConfig');
                });
            }, err => console.error('getAuthConfig', err),
            () => this.loaderService.closeLoader('getAuthConfig'));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    login(event) {
        if (event === true) {
            this.inProcess = true;
            this.awsAuthService.signIn(this.signIn)
              .pipe(takeUntil(this.destroy$))
              .subscribe((response: LoginResponse) => {
                    this.processLoginResponse(response);
                    this.inProcess = false;
                },
                () => this.inProcess = false);
        }
    }

    private processLoginResponse(response: LoginResponse) {
        this.authHolderService.persist(response.accessToken, response.refreshToken);
        this.router.navigate(['app-store']);
    }

    sendActivationEmail(email: string) {
        this.usersService.resendActivationMail(email)
          .pipe(takeUntil(this.destroy$))
          .subscribe(value => {
              this.toastService.success('Activation email was sent to your inbox!');
          });
    }
}
