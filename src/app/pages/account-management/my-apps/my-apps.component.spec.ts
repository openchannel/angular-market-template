import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { MyAppsComponent } from './my-apps.component';
import {
    MockAppShortInfoComponent,
    MockAppsService,
    MockDropdownComponent,
    MockFrontendService,
    MockInfiniteScrollDirective,
    MockLoadingBarService,
    MockNgbDropdownDirective,
    MockNgbDropdownMenuDirective,
    MockNgbDropdownToggleDirective,
    MockRoutingComponent,
} from '../../../../mock/mock';
import { RouterTestingModule } from '@angular/router/testing';
import { AppsService, FrontendService } from '../../../../../../angular-template-libraries/dist/angular-common-services';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

describe('MyAppsComponent', () => {
    let component: MyAppsComponent;
    let fixture: ComponentFixture<MyAppsComponent>;
    let router: Router;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    MyAppsComponent,
                    MockDropdownComponent,
                    MockInfiniteScrollDirective,
                    MockAppShortInfoComponent,
                    MockNgbDropdownMenuDirective,
                    MockNgbDropdownDirective,
                    MockNgbDropdownToggleDirective,
                ],
                imports: [
                    RouterTestingModule.withRoutes([
                        {
                            path: 'details/some-app',
                            component: MockRoutingComponent,
                        },
                    ]),
                ],
                providers: [
                    { provide: AppsService, useClass: MockAppsService },
                    { provide: FrontendService, useClass: MockFrontendService },
                    { provide: LoadingBarService, useClass: MockLoadingBarService },
                ],
            }).compileComponents();
            router = TestBed.inject(Router);
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(MyAppsComponent);
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

    it('should set appSorts in ngOnInit', fakeAsync(() => {
        component.appSorts = undefined;

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnInit();
        tick();

        expect(component.appSorts).not.toBeUndefined();
    }));

    it('should set selectedSort if appSorts exists', fakeAsync(() => {
        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnInit();
        tick();

        expect(component.selectedSort).toEqual(component.appSorts[0]);
    }));

    it('should correctly set selectedSort and appSorts when frontendService.getSorts returns an empty array', fakeAsync(() => {
        component.appSorts = [];
        component.selectedSort = undefined;
        const sortsList = [...MockFrontendService.MOCK_SORTS_PAGE.list];
        MockFrontendService.MOCK_SORTS_PAGE.list = [];

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnInit();
        tick();

        expect(component.appSorts).toBeNull();
        expect(component.selectedSort).toBeUndefined();

        MockFrontendService.MOCK_SORTS_PAGE.list = sortsList;
    }));

    it('should call getApps with correct params', () => {
        jest.spyOn((component as any).appsService, 'getApps');

        (component as any).loadApps();

        expect((component as any).appsService.getApps).toHaveBeenCalledWith(
            (component as any).pageNumber,
            5,
            component.selectedSort?.value || '',
            '',
            true,
        );
    });

    it('should set appList and appsLoaded flag to true in loadApps function', fakeAsync(() => {
        component.appsLoaded = false;
        component.appList = [];

        (component as any).loadApps();
        tick();

        expect(component.appList.length).not.toBe(0);
        expect(component.appsLoaded).toBeTruthy();
    }));

    it('should leave old apps in a list when loading new apps', fakeAsync(() => {
        component.appList = [];

        (component as any).loadApps();
        tick();

        const oldLength = component.appList.length;

        (component as any).loadApps();
        tick();

        expect(component.appList.length).toBe(oldLength + (component.appList.length - oldLength));
    }));

    it('should call history.back on Back button click', () => {
        history.back = jest.fn();

        const backLink = fixture.debugElement.query(By.css('.back-link')).nativeElement;
        backLink.click();

        expect(history.back).toHaveBeenCalled();
    });

    it('should show no apps message if apps were loaded and there are no apps', () => {
        component.appsLoaded = true;
        component.appList = [];
        fixture.detectChanges();

        const noAppsMsg = fixture.debugElement.query(By.css('.no-apps-message'));
        expect(noAppsMsg).toBeTruthy();
    });

    it('should render dropdown with appSorts if apps sorts exist and apps list is not empty', () => {
        const sortsDropdown = fixture.debugElement.query(By.directive(MockDropdownComponent));
        expect(sortsDropdown).toBeTruthy();
    });

    it('should pass options and selectedSort to dropdown', () => {
        const sortsDropdownInstance = fixture.debugElement.query(By.directive(MockDropdownComponent)).componentInstance;
        expect(sortsDropdownInstance.options).toEqual(component.appSorts);
        expect(sortsDropdownInstance.selected).toEqual(component.selectedSort);
    });

    it('should set selected sort, reset apps, page number and load apps when sort has changed', () => {
        (component as any).loadApps = jest.fn();
        const newSort = component.appSorts[1];

        const sortsDropdownDE = fixture.debugElement.query(By.directive(MockDropdownComponent));
        sortsDropdownDE.triggerEventHandler('selectedChange', newSort);

        expect((component as any).pageNumber).toBe(1);
        expect(component.appList.length).toBe(0);
        expect(component.selectedSort).toEqual(newSort);
        expect((component as any).loadApps).toHaveBeenCalled();
    });

    it('should increase page number and load more apps on page scroll', () => {
        const prevPageNumber = (component as any).pageNumber;
        (component as any).loadApps = jest.fn();

        const appsContainer = fixture.debugElement.query(By.css('.apps-container'));
        appsContainer.triggerEventHandler('scrolled', {});

        expect((component as any).pageNumber).toBe(prevPageNumber + ((component as any).pageNumber - prevPageNumber));
        expect((component as any).loadApps).toHaveBeenCalled();
    });

    it('should render oc-app-short-info for each app', () => {
        const appsShortInfo = fixture.debugElement.queryAll(By.directive(MockAppShortInfoComponent));
        expect(appsShortInfo.length).toBe(component.appList.length);
    });

    it('should pass app to oc-app-short-info', () => {
        const appsShortInfo = fixture.debugElement.queryAll(By.directive(MockAppShortInfoComponent));
        expect(appsShortInfo[0].componentInstance.app).toEqual(component.appList[0]);
    });

    it('should navigate to app on oc-app-short-info click', fakeAsync(() => {
        const appShortInfoDE = fixture.debugElement.query(By.directive(MockAppShortInfoComponent));
        appShortInfoDE.triggerEventHandler('clickByAppCard', { safeName: ['some-app'] });
        tick();

        expect(router.url).toBe('/details/some-app');
    }));
});
