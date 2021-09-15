import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    AuthenticationService,
    AuthHolderService,
    LoginRequest,
    LoginResponse,
    NativeLoginService,
} from '@openchannel/angular-common-services';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { OAuthService } from 'angular-oauth2-oidc';
import { ToastrService } from 'ngx-toastr';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { ComponentsUserLoginModel } from '@openchannel/angular-common-components';
import { CmsContentService } from '@core/services/cms-content-service/cms-content-service.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
    signupUrl = '/signup';
    forgotPwdUrl = '/forgot-password';
    signIn = new ComponentsUserLoginModel();
    inProcess = false;
    isLoading = false;

    isSsoLogin = true;

    cmsData = {
        loginImageURL: '',
    };

    private destroy$: Subject<void> = new Subject();
    private loader: LoadingBarState;
    private returnUrl: string;

    constructor(
        public loadingBar: LoadingBarService,
        private router: Router,
        private route: ActivatedRoute,
        private authHolderService: AuthHolderService,
        private oauthService: OAuthService,
        private openIdAuthService: AuthenticationService,
        private nativeLoginService: NativeLoginService,
        private toastService: ToastrService,
        private cmsService: CmsContentService,
    ) {}

    ngOnInit(): void {
        this.loader = this.loadingBar.useRef();
        if (this.authHolderService.isLoggedInUser()) {
            this.router.navigate(['']).then();
        }

        this.retrieveRedirectUrl();

        this.loader.start();

        this.oauthService.events.pipe(takeUntil(this.destroy$)).subscribe(oAuthEvent => {
            if (oAuthEvent.type === 'token_received') {
                this.loader.start();
                this.openIdAuthService
                    .login(new LoginRequest(this.oauthService.getIdToken(), this.oauthService.getAccessToken()))
                    .pipe(takeUntil(this.destroy$))
                    .subscribe((response: LoginResponse) => {
                        this.processLoginResponse(response, this.oauthService.state);
                        this.loader.complete();
                    });
            }
        });

        this.openIdAuthService
            .getAuthConfig()
            .pipe(
                tap(value => (this.isSsoLogin = !!value)),
                filter(value => value),
                takeUntil(this.destroy$),
            )
            .subscribe(
                authConfig => {
                    this.oauthService.configure({
                        ...authConfig,
                        responseType: authConfig.grantType === 'authorization_code' ? 'code' : '',
                        redirectUri: authConfig.redirectUri || window.location.origin + '/login',
                    });

                    this.oauthService
                        .loadDiscoveryDocumentAndLogin({
                            state: this.returnUrl,
                        })
                        .then(() => {
                            this.loader.complete();
                        });
                },
                () => (this.isSsoLogin = false),
                () => this.loader.complete(),
            );

        this.initCMSData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    login(event) {
        if (event === true) {
            this.inProcess = true;
            this.nativeLoginService
                .signIn(this.signIn)
                .pipe(takeUntil(this.destroy$))
                .subscribe(
                    (response: LoginResponse) => {
                        this.processLoginResponse(response, this.returnUrl);
                        this.inProcess = false;
                    },
                    () => (this.inProcess = false),
                );
        }
    }

    sendActivationEmail(email: string) {
        this.nativeLoginService
            .sendActivationCode(email)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.toastService.success('Activation email was sent to your inbox!');
            });
    }

    private retrieveRedirectUrl() {
        this.returnUrl = this.route.snapshot.queryParams.returnUrl || '';
    }

    private processLoginResponse(response: LoginResponse, redirectUrl: string) {
        this.authHolderService.persist(response.accessToken, response.refreshToken);
        this.router.navigate([redirectUrl || '']);
    }

    private initCMSData(): void {
        this.cmsService
            .getContentByPaths({
                loginImageURL: 'login.logo',
            })
            .subscribe(content => {
                this.cmsData.loginImageURL = content.loginImageURL as string;
            });
    }
}
