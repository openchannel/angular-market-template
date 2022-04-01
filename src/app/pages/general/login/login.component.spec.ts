import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import {
    createMockedBrowserStorage,
    MockAuthenticationService,
    MockAuthHolderService,
    MockCmsContentService,
    MockLoadingBarService,
    MockLoginRequest,
    MockNativeLoginService,
    MockOAuthService,
    MockOcLoginComponent,
    MockToastrService,
} from '../../../../mock/mock';
import { RouterTestingModule } from '@angular/router/testing';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { AuthenticationService, AuthHolderService, NativeLoginService } from '@openchannel/angular-common-services';
import { OAuthService } from 'angular-oauth2-oidc';
import { ToastrService } from 'ngx-toastr';
import { CmsContentService } from '@core/services/cms-content-service/cms-content-service.service';
import { of, throwError } from 'rxjs';

jest.doMock('@openchannel/angular-common-services', () => ({
    ...jest.requireActual('@openchannel/angular-common-services'),
    LoginRequest: MockLoginRequest,
}));

Object.defineProperty(window, 'sessionStorage', {
    value: createMockedBrowserStorage(),
});

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [LoginComponent, MockOcLoginComponent],
                imports: [RouterTestingModule],
                providers: [
                    { provide: LoadingBarService, useClass: MockLoadingBarService },
                    { provide: AuthHolderService, useClass: MockAuthHolderService },
                    { provide: OAuthService, useClass: MockOAuthService },
                    { provide: AuthenticationService, useClass: MockAuthenticationService },
                    { provide: NativeLoginService, useClass: MockNativeLoginService },
                    { provide: ToastrService, useClass: MockToastrService },
                    { provide: CmsContentService, useClass: MockCmsContentService },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        window.sessionStorage.clear();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should complete destroy$ and loader in ngOnDestroy hook', () => {
        jest.spyOn((component as any).destroy$, 'complete');
        jest.spyOn((component as any).loader, 'complete');

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnDestroy();

        expect((component as any).destroy$.complete).toHaveBeenCalled();
        expect((component as any).loader.complete).toHaveBeenCalled();
    });

    it('should call nativeLoginService.signIn() method if method was invoked with event=true (login())', () => {
        const signInMock = jest.spyOn((component as any).nativeLoginService, 'signIn');

        component.login(true);
        expect(signInMock).toHaveBeenCalled();

        signInMock.mockClear();

        component.login(false);
        expect(signInMock).not.toHaveBeenCalled();
    });

    it('should call nativeLoginService.signIn() method with signIn component"s model (login())', () => {
        const mockSignInModel = {
            email: 'test@gmail.com',
            password: 'qwerty123',
            isChecked: true,
        };
        const signInMock = jest.spyOn((component as any).nativeLoginService, 'signIn');
        component.signIn = mockSignInModel;

        component.login(true);
        expect(signInMock).toHaveBeenCalledWith(mockSignInModel);
    });

    it('should call processLoginResponse() with correct arguments if nativeLoginService.signIn() emits (login())', fakeAsync(() => {
        const mockLoginResponse = {
            refreshToken: '1',
            accessToken: '2',
        };
        (component as any).nativeLoginService.signIn = jest.fn().mockReturnValue(of(mockLoginResponse));
        jest.spyOn(component as any, 'processLoginResponse');

        component.login(true);
        tick();

        expect((component as any).processLoginResponse).toHaveBeenCalledWith(mockLoginResponse, (component as any).returnUrl);
    }));

    it('should set inProcess=false if nativeLoginService.signIn() completes (login())', fakeAsync(() => {
        component.inProcess = true;

        component.login(true);
        tick();

        expect(component.inProcess).toBeFalsy();
    }));

    it('should call nativeLoginService.sendActivationCode() with correct arguments (sendActivationEmail())', () => {
        const email = 'test@gmail.com';
        const mockSendActivationCode = jest.spyOn((component as any).nativeLoginService, 'sendActivationCode');

        component.sendActivationEmail(email);

        expect(mockSendActivationCode).toHaveBeenCalledWith(email);
    });

    it('should show toaster when nativeLoginService.sendActivationCode() emits (sendActivationEmail())', fakeAsync(() => {
        const mockToasterSuccess = jest.spyOn((component as any).toastService, 'success');

        component.sendActivationEmail('');
        tick();

        expect(mockToasterSuccess).toHaveBeenCalled();
    }));

    it('should subscribe to the oAuth events (setupLoginFlowResponseProcess())', () => {
        const mockAuthEventsSubscribe = jest.spyOn((component as any).oauthService.events, 'subscribe');

        (component as any).setupLoginFlowResponseProcess();

        expect(mockAuthEventsSubscribe).toHaveBeenCalled();
    });

    it('should call openIdAuthService.login() with correct arguments only if oAuthEvent.type=token_received (setupLoginFlowResponseProcess())', fakeAsync(() => {
        // Test setup
        const mockIdToken = '123';
        const mockAccessToken = '456';

        (component as any).oauthService.getIdToken = jest.fn().mockReturnValue(mockIdToken);
        (component as any).oauthService.getAccessToken = jest.fn().mockReturnValue(mockAccessToken);
        (component as any).processLoginResponse = jest.fn();
        (component as any).authConfig = { grantType: 'authorization_code' };

        const mockAuthLoginMethod = jest.spyOn((component as any).openIdAuthService, 'login');
        (component as any).setupLoginFlowResponseProcess();

        // Test that mockAuthLoginMethod is called
        (component as any).oauthService.events.next({ type: 'token_received' });
        tick();
        expect(mockAuthLoginMethod).toHaveBeenCalledWith(new MockLoginRequest(mockIdToken, mockAccessToken));

        mockAuthLoginMethod.mockClear();

        // Test that mockAuthLoginMethod is not called
        (component as any).oauthService.events.next({ type: '' });
        tick();
        expect(mockAuthLoginMethod).not.toHaveBeenCalled();
    }));

    it('should call processLoginResponse() with the response from the openIdAuthService.login() (setupLoginFlowResponseProcess())', fakeAsync(() => {
        // Test setup
        const mockLoginResp = {
            refreshToken: '123',
            accessToken: '456',
        };

        (component as any).openIdAuthService.login = jest.fn().mockReturnValue(of(mockLoginResp));
        (component as any).processLoginResponse = jest.fn();
        (component as any).authConfig = { grantType: 'authorization_code' };

        (component as any).setupLoginFlowResponseProcess();

        // Test that processLoginResponse is called with login response
        (component as any).oauthService.events.next({ type: 'token_received' });
        tick();
        expect((component as any).processLoginResponse).toHaveBeenCalledWith(mockLoginResp, expect.anything());
    }));

    it('should decode redirectUrl if authConfig.grantType=authorization_code and pass it to processLoginResponse() (setupLoginFlowResponseProcess())', fakeAsync(() => {
        // Test setup
        const mockAuthState = 'testState';
        const mockAuthStateDecoded = 'testStateDecoded';
        jest.spyOn(global, 'decodeURIComponent').mockReturnValue(mockAuthStateDecoded);

        (component as any).oauthService.state = mockAuthState;
        (component as any).processLoginResponse = jest.fn();
        (component as any).authConfig = { grantType: 'authorization_code' };

        (component as any).setupLoginFlowResponseProcess();

        // Test that decodeURIComponent is called with authState if authConfig.grantType=authorization_code
        (component as any).oauthService.events.next({ type: 'token_received' });
        tick();
        expect((component as any).processLoginResponse).toHaveBeenCalledWith(expect.anything(), mockAuthStateDecoded);
    }));

    it('should call oauthService.logOut() if openIdAuthService.login() errors (setupLoginFlowResponseProcess())', fakeAsync(() => {
        // Test setup
        const mockOauthLogout = jest.spyOn((component as any).oauthService, 'logOut');
        (component as any).openIdAuthService.login = jest.fn().mockReturnValue(throwError('Error'));

        (component as any).setupLoginFlowResponseProcess();

        // Test that oauthService.logOut is called on login error
        (component as any).oauthService.events.next({ type: 'token_received' });
        tick();
        expect(mockOauthLogout).toHaveBeenCalledWith(true);
    }));

    it('should set decoded url part to the returnUrl (checkState())', fakeAsync(() => {
        // Test setup
        const urlPartDecoded = 'testUrlPartDecoded';

        (component as any).router.navigate([], { queryParams: { state: 'testState;testUrlPart' } });
        tick();

        jest.spyOn(global, 'decodeURIComponent').mockReturnValue(urlPartDecoded);
        (component as any).returnUrl = '';

        // Test that return url is set after checkState() execution
        (component as any).checkState();
        expect((component as any).returnUrl).toBe(urlPartDecoded);
    }));

    it('should set null to the returnUrl if encodedUrlPart does not exist (checkState())', fakeAsync(() => {
        // Test setup
        (component as any).router.navigate([], { queryParams: { state: 'testState' } });
        tick();

        // Test that null is set to the returnUrl
        (component as any).checkState();
        expect((component as any).returnUrl).toBeNull();
    }));

    it('should return true if the url state is equal to the "nonce" from the sessionStorage (checkState())', fakeAsync(() => {
        // Test setup
        const state = 'testState';

        (component as any).router.navigate([], { queryParams: { state } });
        tick();
        window.sessionStorage.setItem('nonce', state);

        // Test that checkState returns true if state === nonce from the sessionStorage
        expect((component as any).checkState()).toBe(true);
    }));
});
