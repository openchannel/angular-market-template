import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import {
    MockAuthenticationService,
    MockAuthHolderService,
    MockCmsContentService,
    MockLoadingBarService,
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

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
