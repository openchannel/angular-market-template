import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { MyProfileComponent } from './my-profile.component';
import { By } from '@angular/platform-browser';
import {
    MockBillingComponent,
    MockBillingHistoryComponent,
    MockChangePasswordComponent,
    MockGeneralProfileComponent,
    MockPageTitleComponent,
    MockRoutingComponent,
} from '../../../../mock/mock';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { PaymentsGateways } from '@openchannel/angular-common-services';

// Default site config that is used to reset mockSiteConfig before each test
const mockSiteConfigDefault = Object.freeze({ paymentsEnabled: true, paymentsGateway: PaymentsGateways.STRIPE });

let mockSiteConfig = { ...mockSiteConfigDefault };

jest.mock('assets/data/siteConfig', () => ({
    // Use getter so we can use variable and reset before each test
    get siteConfig(): any {
        return mockSiteConfig;
    },
}));

describe('MyProfileComponent', () => {
    let component: MyProfileComponent;
    let fixture: ComponentFixture<MyProfileComponent>;
    let router: Router;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    MyProfileComponent,
                    MockPageTitleComponent,
                    MockGeneralProfileComponent,
                    MockChangePasswordComponent,
                    MockBillingComponent,
                    MockBillingHistoryComponent,
                ],
                imports: [
                    RouterTestingModule.withRoutes([
                        { path: 'my-profile/profile-details', component: MockRoutingComponent },
                        { path: 'my-profile/password', component: MockRoutingComponent },
                        { path: 'my-profile/billing', component: MockRoutingComponent },
                        { path: 'my-profile/billing-history', component: MockRoutingComponent },
                    ]),
                ],
            }).compileComponents();
            router = TestBed.inject(Router);
        }),
    );

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(MyProfileComponent);
        component = fixture.componentInstance;

        // Navigate to the default my profile page
        router.navigate(['my-profile/profile-details']).then();
        tick();

        fixture.detectChanges();
    }));

    // Reset mocked site config to the default
    beforeEach(() => {
        mockSiteConfig = { ...mockSiteConfigDefault };
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getAvailablePages method should return billing pages if payments are enabled and paymentsGateway is Stripe', () => {
        mockSiteConfig.paymentsEnabled = true;
        mockSiteConfig.paymentsGateway = PaymentsGateways.STRIPE;

        expect(component.getAvailablePages()).toEqual([...component.basePages, ...component.billingPages]);
    });

    it('getAvailablePages method should not return billing pages if payments are not enabled', () => {
        mockSiteConfig.paymentsEnabled = false;

        expect(component.getAvailablePages()).toEqual([...component.basePages]);
    });

    it('getAvailablePages method should not return billing pages if paymentsGateway is not Stripe', () => {
        mockSiteConfig.paymentsGateway = PaymentsGateways.CUSTOM;

        expect(component.getAvailablePages()).toEqual([...component.basePages]);
    });

    it('should set selectedPage according to the current url in ngOnInit hook', fakeAsync(() => {
        component.selectedPage = null;
        const newPage = component.pages[1];

        router.navigate([newPage.routerLink]);
        tick();

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnInit();

        expect(component.selectedPage).toEqual(newPage);
    }));

    it('gotoPage method should set the new selectedPage', () => {
        component.selectedPage = null;
        const newPage = component.pages[1];

        component.gotoPage(newPage);
        expect(component.selectedPage).toEqual(newPage);
    });

    it('gotoPage method should call location.replaceState method with correct url', () => {
        jest.spyOn((component as any).location, 'replaceState');
        const newPage = component.pages[1];

        component.gotoPage(newPage);
        expect((component as any).location.replaceState).toHaveBeenCalledWith(newPage.routerLink);
    });

    it('goBack method should call history.back method', () => {
        history.back = jest.fn();
        component.goBack();
        expect(history.back).toHaveBeenCalled();
    });

    it('should call goBack method when app-page-title emits navigateClick', () => {
        jest.spyOn(component, 'goBack');

        const pageTitleDE = fixture.debugElement.query(By.directive(MockPageTitleComponent));
        pageTitleDE.triggerEventHandler('navigateClick', {});

        expect(component.goBack).toHaveBeenCalled();
    });

    it('should render li items for each currentPages item', () => {
        const pagesItems = fixture.debugElement.queryAll(By.css('.pages-list__item'));
        expect(component.pages.length).toBe(pagesItems.length);
    });

    it('gotoPage method should be called when page was clicked', () => {
        jest.spyOn(component, 'gotoPage');

        const pageLinkElement = fixture.debugElement.query(By.css('.pages-list__item a')).nativeElement;
        pageLinkElement.click();

        expect(component.gotoPage).toHaveBeenCalledWith(component.pages[0]);
    });

    it('should add active-link class to page if it is a current page', () => {
        component.selectedPage = component.pages[0];
        fixture.detectChanges();

        const pageLinkElement = fixture.debugElement.query(By.css('.pages-list__item a')).nativeElement;
        expect(pageLinkElement.classList.contains('active-link')).toBeTruthy();
    });

    it('should use page.placeholder as page name in template', () => {
        const pageLinkElement = fixture.debugElement.query(By.css('.pages-list__item a')).nativeElement;
        expect(pageLinkElement.textContent.trim()).toBe(component.pages[0].placeholder.trim());
    });

    it('should set col-lg-9 and col-xxl-10 classes to the pages container if current page is the billing-history page', () => {
        const billingHistoryPage = component.pages.find(page => (page.pageId = 'billing-history'));
        component.gotoPage(billingHistoryPage);
        fixture.detectChanges();

        const pagesContainer = fixture.debugElement.query(By.css('.pages-container')).nativeElement;
        expect(pagesContainer.classList.contains('col-lg-9')).toBeTruthy();
        expect(pagesContainer.classList.contains('col-xxl-10')).toBeTruthy();
    });

    it('should render correct page according to the selectedPage.pageId', () => {
        const componentNameToDirectiveMap = {
            generalProfile: MockGeneralProfileComponent,
            changePassword: MockChangePasswordComponent,
            billing: MockBillingComponent,
            billingHistory: MockBillingHistoryComponent,
        };

        // Change current page, run change detection and check correct component renders
        const changePageAndCheck = (componentName: string, pageIndex: number) => {
            component.gotoPage(component.pages[pageIndex]);
            fixture.detectChanges();
            checkOnlyOneComponentRendered(Object.keys(componentNameToDirectiveMap)[pageIndex]);
        };

        // Checks if only current page component rendered
        const checkOnlyOneComponentRendered = (renderedComponentName: string) => {
            Object.entries(componentNameToDirectiveMap).forEach(([componentName, directive]) => {
                const deElement = fixture.debugElement.query(By.directive(directive));

                if (componentName === renderedComponentName) {
                    expect(deElement).toBeTruthy();
                } else {
                    expect(deElement).toBeNull();
                }
            });
        };

        Object.keys(componentNameToDirectiveMap).forEach((componentName, i) => {
            changePageAndCheck(componentName, i);
        });
    });
});
