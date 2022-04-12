import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { CmsContentService } from '@core/services/cms-content-service/cms-content-service.service';
import {
    MockAuthenticationService,
    MockAuthHolderService,
    MockCmsContentService,
    MockLogOutService,
    MockOcProfileNavbar,
    MockPermissionDirective,
    MockRoutingComponent,
    MockSvgIconComponent,
} from '../../../../mock/mock';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService, AuthHolderService } from '@openchannel/angular-common-services';
import { LogOutService } from '@core/services/logout-service/log-out.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { By } from '@angular/platform-browser';
import { siteConfig } from 'assets/data/siteConfig';
import { RouterTestingModule } from '@angular/router/testing';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let router: Router;
    let location: Location;

    const getMockProfileNavbar = () => fixture.debugElement.query(By.directive(MockOcProfileNavbar));

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HeaderComponent, MockRoutingComponent, MockOcProfileNavbar, MockPermissionDirective, MockSvgIconComponent],
            providers: [
                { provide: CmsContentService, useClass: MockCmsContentService },
                { provide: AuthHolderService, useClass: MockAuthHolderService },
                { provide: AuthenticationService, useClass: MockAuthenticationService },
                { provide: LogOutService, useClass: MockLogOutService },
            ],
            imports: [RouterTestingModule, NgbModule],
        }).compileComponents();

        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;

        jest.resetAllMocks();

        router = TestBed.inject(Router);
        location = TestBed.inject(Location);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('openIdAuthService.getAuthConfig() should set isSsoConfigExist value', fakeAsync(() => {
        component.isSsoConfigExist = true;

        jest.spyOn((component as any).openIdAuthService, 'getAuthConfig').mockReturnValue(of({}));

        fixture.detectChanges();
        tick();

        expect(component.isSsoConfigExist).toBeTruthy();
    }));

    it('should set correct data in ngOnInit', fakeAsync(() => {
        const cmsService = TestBed.inject(CmsContentService);
        const authHolderService = TestBed.inject(AuthHolderService);

        const mockedResult = {
            headerLogoURL: 'assets/img/logo-company.png',
            headerItemsDFA: [
                {
                    label: 'mock',
                    location: 'mock',
                },
            ],
        };
        component.cmsData = {
            headerLogoURL: '',
            headerItemsDFA: [],
        };

        jest.spyOn(cmsService, 'getContentByPaths').mockReturnValue(of(mockedResult));
        jest.spyOn(component, 'initCMSData');

        fixture.detectChanges();
        tick();

        expect(component.isBilling).toEqual(siteConfig.paymentsEnabled);
        expect(component.isSSO).toEqual(authHolderService.userDetails.isSSO);

        expect(component.initCMSData).toBeCalled();

        expect(component.cmsData.headerLogoURL).toBe(mockedResult.headerLogoURL);
        expect(component.cmsData.headerItemsDFA).toStrictEqual(mockedResult.headerItemsDFA);

        const brandLogo = fixture.debugElement.query(By.css('.company-logo'));
        const headerItemsDFA = fixture.debugElement.queryAll(By.css('.navbar-collapse .navbar-nav .nav-item[routerLinkActive="active"]'));

        expect(brandLogo.attributes.src).toBe(mockedResult.headerLogoURL);
        expect(headerItemsDFA.length).toBe(mockedResult.headerItemsDFA.length);
    }));

    it('should call logOutAndRedirect when .nav-link clicked', fakeAsync(() => {
        const logOut = TestBed.inject(LogOutService);
        jest.spyOn(logOut, 'logOutAndRedirect');

        fixture.detectChanges();

        const dropdownItems = fixture.debugElement.queryAll(By.css('.collaps-items .collapse .navbar-nav .nav-item .nav-link'));
        const logOutElement = dropdownItems[dropdownItems.length - 1];

        logOutElement.triggerEventHandler('click', {});

        expect(logOut.logOutAndRedirect).toBeCalledWith('/');
    }));

    it('closeMenu() should set isMenuCollapsed and isCollapsed to true', () => {
        component.isMenuCollapsed = false;
        component.isCollapsed = false;

        component.closedMenu();

        expect(component.isMenuCollapsed).toBeTruthy();
        expect(component.isCollapsed).toBeTruthy();
    });

    it('should inject value to OcProfileNavbar.username', () => {
        fixture.detectChanges();

        expect(getMockProfileNavbar().componentInstance.username).toEqual('More');
    });

    it('should check checkIncludesUrl method work', () => {
        fixture.detectChanges();

        const urlCheckItem = fixture.debugElement.query(By.css('.navbar-collapse .navbar-nav .collaps-none'));

        jest.spyOn(router, 'url', 'get').mockReturnValue('my-profile');

        fixture.detectChanges();

        expect(urlCheckItem.nativeElement.classList).toContain('active');

        jest.spyOn(router, 'url', 'get').mockReturnValue('test');

        fixture.detectChanges();

        expect(urlCheckItem.nativeElement.classList).not.toContain('active');
    });
});
