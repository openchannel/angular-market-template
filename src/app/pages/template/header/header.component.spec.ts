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
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationService, AuthHolderService } from '@openchannel/angular-common-services';
import { LogOutService } from '@core/services/logout-service/log-out.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let router: Router;
    let location: Location;
    let activatedRoute: ActivatedRoute;

    const getMockProfileNavbar = () => fixture.debugElement.query(By.directive(MockOcProfileNavbar));
    const routes: Routes = [
        {
            path: 'mock',
            component: MockRoutingComponent,
        },
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HeaderComponent, MockRoutingComponent, MockOcProfileNavbar, MockPermissionDirective, MockSvgIconComponent],
            providers: [
                { provide: CmsContentService, useClass: MockCmsContentService },
                { provide: AuthHolderService, useClass: MockAuthHolderService },
                { provide: AuthenticationService, useClass: MockAuthenticationService },
                { provide: LogOutService, useClass: MockLogOutService, deps: [Router] },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { fragment: '#mock' },
                    },
                },
            ],
            imports: [RouterTestingModule.withRoutes(routes), NgbModule],
        }).compileComponents();

        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;

        jest.resetAllMocks();

        router = TestBed.inject(Router);
        location = TestBed.inject(Location);
        activatedRoute = TestBed.inject(ActivatedRoute);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('openIdAuthService.getAuthConfig() should set isSsoConfigExist value', fakeAsync(() => {
        component.isSsoConfigExist = true;

        jest.spyOn((component as any).openIdAuthService, 'getAuthConfig').mockReturnValue(of(false));

        fixture.detectChanges();
        tick();

        expect(component.isSsoConfigExist).toBeFalsy();
    }));

    it('should set correct cmsData in initCMSData', fakeAsync(() => {
        component.cmsData = {
            headerLogoURL: '',
            headerItemsDFA: [],
        };
        const mockedResult = {
            headerLogoURL: 'assets/img/logo-company.png',
            headerItemsDFA: [
                {
                    label: 'mock',
                    location: 'mock',
                },
            ],
        };

        jest.spyOn((component as any).cmsService, 'getContentByPaths').mockReturnValue(of(mockedResult));
        jest.spyOn(component, 'initCMSData');

        fixture.detectChanges();
        tick();

        expect(component.initCMSData).toBeCalled();
        expect(component.cmsData.headerLogoURL).toBe(mockedResult.headerLogoURL);
        expect(component.cmsData.headerItemsDFA).toStrictEqual(mockedResult.headerItemsDFA);
    }));

    it('logout() should redirect to empty route', fakeAsync(() => {
        jest.spyOn((component as any).logOut, 'logOutAndRedirect');

        component.router.navigate(['mock']).then(() => {
            component.logout();
            tick();

            expect((component as any).logOut.logOutAndRedirect).toBeCalled();
            expect(location.path()).toBe('/');
        });
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

    it('should check checkIncludesUrl method work', fakeAsync(() => {
        component.router.navigate(['/mock']).then(() => {
            const returnedValue = component.checkIncludesUrl('mock');

            expect(returnedValue).toBe(true);
        });
    }));
});
