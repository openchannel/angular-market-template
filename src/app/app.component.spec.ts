import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationService, SiteConfigService } from '@openchannel/angular-common-services';
import { AppComponent } from './app.component';
import {
    MockAuthenticationService,
    MockCmsContentService,
    MockLoadingBarService,
    MockLogOutService,
    MockNgxLoadingBarComponent,
    MockNotificationComponent,
    MockSiteConfigService,
} from '../mock/mock';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { CmsContentService } from '@core/services/cms-content-service/cms-content-service.service';
import { throwError } from 'rxjs';
import { LogOutService } from '@core/services/logout-service/log-out.service';
import { Router } from '@angular/router';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [AppComponent, MockNgxLoadingBarComponent, MockNotificationComponent],
                imports: [RouterTestingModule],
                providers: [
                    { provide: AuthenticationService, useClass: MockAuthenticationService },
                    { provide: SiteConfigService, useClass: MockSiteConfigService },
                    { provide: LoadingBarService, useClass: MockLoadingBarService },
                    { provide: CmsContentService, useClass: MockCmsContentService },
                    { provide: LogOutService, useClass: MockLogOutService, deps: [Router] },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
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

    it('should init site config in ngOnInit hook', fakeAsync(() => {
        jest.spyOn((component as any).siteService, 'initSiteConfiguration');

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnInit();
        tick();

        expect((component as any).siteService.initSiteConfiguration).toHaveBeenCalled();
    }));

    it('should try login by refresh token in ngOnInit hook', () => {
        jest.spyOn((component as any).authenticationService, 'tryLoginByRefreshToken');

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnInit();

        expect((component as any).authenticationService.tryLoginByRefreshToken).toHaveBeenCalled();
    });

    it('should init csrf token in ngOnInit hook', () => {
        jest.spyOn((component as any).authenticationService, 'initCsrf');

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnInit();

        expect((component as any).authenticationService.initCsrf).toHaveBeenCalled();
    });

    it('should stop loader if try login by refresh token in ngOnInit hook fails', fakeAsync(() => {
        (component as any).authenticationService.tryLoginByRefreshToken = () => throwError('Error');
        jest.spyOn((component as any).loader, 'stop');

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnInit();
        tick();

        expect((component as any).loader.stop).toHaveBeenCalled();
    }));

    it('should set title and favicon href in config from cms data', fakeAsync(() => {
        (component as any).siteService.initSiteConfiguration = jest.fn();

        component.initSiteConfig();
        tick();

        const setConfig = (component as any).siteService.initSiteConfiguration.mock.calls[0][0];

        expect(setConfig.title).toBe(MockCmsContentService.CMS_DATA.site.title);
        expect(setConfig.favicon.href).toBe(MockCmsContentService.CMS_DATA.site.favicon);
    }));
});
