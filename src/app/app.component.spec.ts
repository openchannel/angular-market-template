import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationService, SiteConfigService } from '@openchannel/angular-common-services';
import { AppComponent } from './app.component';

import { CmsContentService } from '@core/services/cms-content-service/cms-content-service.service';
import { of, throwError } from 'rxjs';
import { LogOutService } from '@core/services/logout-service/log-out.service';
import { MockNgxLoadingBarComponent, MockNotificationComponent } from '../mock/components.mock';
import { siteConfig } from '../assets/data/siteConfig';
import {
    mockAuthenticationService,
    mockCmsContentService,
    mockLoadingBarService,
    mockLogOutService,
    mockSiteConfigService,
} from '../mock/providers.mock';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let authenticationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AppComponent, MockNgxLoadingBarComponent, MockNotificationComponent],
            imports: [RouterTestingModule],
            providers: [
                mockAuthenticationService(),
                mockSiteConfigService(),
                mockLoadingBarService(),
                mockCmsContentService(),
                mockLogOutService(),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        authenticationService = TestBed.inject(AuthenticationService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should check component initialization', fakeAsync(() => {
        const logOutService = TestBed.inject(LogOutService);
        const siteService = TestBed.inject(SiteConfigService);
        const cmsService = TestBed.inject(CmsContentService);

        const config = {
            ...siteConfig,
        };
        config.title = 'App Directory';
        config.favicon.href = 'assets/img/favicon.png';

        const mockedResult = {
            siteTitle: 'App Directory',
            siteFaviconHref: 'App Directory',
        };

        jest.spyOn(authenticationService, 'tryLoginByRefreshToken');
        jest.spyOn(authenticationService, 'initCsrf');

        jest.spyOn(logOutService, 'removeSpecificParamKeyFromTheUrlForSaml2Logout');

        jest.spyOn((component as any).loader, 'start');
        jest.spyOn((component as any).loader, 'stop');

        jest.spyOn(siteService, 'initSiteConfiguration');
        jest.spyOn(cmsService, 'getContentByPaths').mockReturnValue(of(mockedResult));

        fixture.detectChanges();

        expect(logOutService.removeSpecificParamKeyFromTheUrlForSaml2Logout).toBeCalled();
        expect(siteService.initSiteConfiguration).toBeCalledWith(config);

        expect((component as any).loader.start).toBeCalled();

        expect((component as any).loader.stop).toBeCalled();

        expect(authenticationService.initCsrf).toBeCalled();

        // should check ngOnDestroy method
        jest.spyOn((component as any).destroy$, 'complete');
        jest.spyOn((component as any).loader, 'complete');

        fixture.destroy();

        expect((component as any).destroy$.complete).toHaveBeenCalled();
        expect((component as any).loader.complete).toHaveBeenCalled();
    }));

    it('should stop loader if tryLoginByRefreshToken fails', fakeAsync(() => {
        jest.spyOn(authenticationService, 'tryLoginByRefreshToken').mockReturnValue(throwError('Error'));
        jest.spyOn((component as any).loader, 'stop');

        fixture.detectChanges();

        expect((component as any).loader.stop).toHaveBeenCalled();
    }));
});
