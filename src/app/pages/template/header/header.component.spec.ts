import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { CmsContentService } from '@core/services/cms-content-service/cms-content-service.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthHolderService } from '@openchannel/angular-common-services';
import { LogOutService } from '@core/services/logout-service/log-out.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { By } from '@angular/platform-browser';
import { siteConfig } from 'assets/data/siteConfig';
import { RouterTestingModule } from '@angular/router/testing';
import {
    mockAuthenticationService,
    mockAuthHolderService,
    mockCmsContentService,
    mockLogOutService,
} from '../../../../mock/providers.mock';
import { MockPermissionDirective } from '../../../../mock/directives.mock';
import { MockOcProfileNavbar, MockRoutingComponent, MockSvgIconComponent } from '../../../../mock/components.mock';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let router: Router;
    let location: Location;
    let authHolderService;

    const getMockProfileNavbar = () => fixture.debugElement.query(By.directive(MockOcProfileNavbar));

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HeaderComponent, MockRoutingComponent, MockOcProfileNavbar, MockPermissionDirective, MockSvgIconComponent],
            providers: [mockCmsContentService(), mockAuthHolderService(), mockAuthenticationService(), mockLogOutService()],
            imports: [RouterTestingModule, NgbModule],
        }).compileComponents();

        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;

        jest.resetAllMocks();

        router = TestBed.inject(Router);
        location = TestBed.inject(Location);
        authHolderService = TestBed.inject(AuthHolderService);
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
        jest.spyOn(component as any, 'initCMSData');

        fixture.detectChanges();
        tick();

        expect(component.isBilling).toEqual(siteConfig.paymentsEnabled);
        expect(component.isSSO).toEqual(authHolderService.userDetails.isSSO);

        expect((component as any).initCMSData).toBeCalled();

        expect(component.cmsData.headerLogoURL).toBe(mockedResult.headerLogoURL);
        expect(component.cmsData.headerItemsDFA).toStrictEqual(mockedResult.headerItemsDFA);

        const brandLogo = fixture.debugElement.query(By.css('.company-logo'));
        const headerItemsDFA = fixture.debugElement.queryAll(By.css('.navbar-collapse .navbar-nav .nav-item[routerLinkActive="active"]'));

        expect(brandLogo.nativeElement.getAttribute('src')).toBe(mockedResult.headerLogoURL);
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

    it('should not display collapseMoreContentBlock because *ngIf', () => {
        const collapseMoreContentBlock = fixture.debugElement.query(By.css('#collapsMoreContent'));

        jest.spyOn(authHolderService, 'isLoggedInUser').mockReturnValueOnce(false);

        expect(collapseMoreContentBlock).toBeNull();
    });

    it('should check template for *ngIf work', () => {
        component.isSSO = false;
        component.isCollapsed = false;
        let navLink;

        fixture.detectChanges();

        const collapseMoreContentBlock = fixture.debugElement.query(By.css('#collapsMoreContent'));
        navLink = fixture.debugElement.query(By.css('a[routerLink="/my-profile/profile-details"'));
        const iconBlock = fixture.debugElement.query(By.css('.navbar-wrapper .cursor-pointer'));

        jest.spyOn(authHolderService, 'isLoggedInUser').mockReturnValueOnce(true);

        expect(navLink).not.toBeNull();
        expect(collapseMoreContentBlock).not.toBeNull();
        expect(iconBlock.nativeElement.classList).toContain('close-icon');

        navLink.triggerEventHandler('click', {});

        fixture.detectChanges();

        expect(iconBlock.nativeElement.classList).toContain('navbar-icon');

        component.isSSO = true;

        fixture.detectChanges();

        navLink = fixture.debugElement.query(By.css('a[routerLink="/my-profile/profile-details"'));

        expect(navLink).toBeNull();
    });

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
