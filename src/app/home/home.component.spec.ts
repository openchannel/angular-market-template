import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { Router } from '@angular/router';
import {
    MockAppCategoriesComponent,
    MockAppGalleryComponent,
    MockAppGetStartedComponent,
    MockAppsService,
    MockCmsContentService,
    MockCollapseWithTitleComponent,
    MockFeaturedAppsComponent,
    MockFrontendService,
    MockLoadingBarService,
    MockRoutingComponent,
    MockSidebarComponent,
    MockSiteConfigService,
    MockTextSearchComponent,
    MockTitleService,
} from '../../mock/mock';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CmsContentService } from '@core/services/cms-content-service/cms-content-service.service';
import { AppsService, FrontendService, SiteConfigService, TitleService } from '@openchannel/angular-common-services';
import { RouterTestingModule } from '@angular/router/testing';
import { FullAppData } from '@openchannel/angular-common-components/src/lib/common-components';
import { pageConfig } from '../../assets/data/configData';
import { By } from '@angular/platform-browser';
import { get } from 'lodash';
import { throwError } from 'rxjs';

const sortById = (a, b) => a.id.localeCompare(b.id);

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;
    let router: Router;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    HomeComponent,
                    MockFeaturedAppsComponent,
                    MockCollapseWithTitleComponent,
                    MockSidebarComponent,
                    MockAppCategoriesComponent,
                    MockAppGalleryComponent,
                    MockAppGetStartedComponent,
                    MockTextSearchComponent,
                ],
                imports: [
                    HttpClientTestingModule,
                    RouterTestingModule.withRoutes([
                        { path: 'browse/collections/allApps', component: MockRoutingComponent },
                        { path: 'some-page', component: MockRoutingComponent },
                    ]),
                ],
                providers: [
                    { provide: AppsService, useClass: MockAppsService },
                    { provide: LoadingBarService, useClass: MockLoadingBarService },
                    { provide: FrontendService, useClass: MockFrontendService },
                    { provide: SiteConfigService, useClass: MockSiteConfigService },
                    { provide: TitleService, useClass: MockTitleService },
                    { provide: CmsContentService, useClass: MockCmsContentService },
                ],
            }).compileComponents();
            router = TestBed.inject(Router);
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should complete destroy$ and loader in ngOnDestroy hook', () => {
        jest.spyOn((component as any).destroy$, 'complete');
        jest.spyOn(component.loader, 'complete');

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnDestroy();

        expect((component as any).destroy$.complete).toHaveBeenCalled();
        expect(component.loader.complete).toHaveBeenCalled();
    });

    it('should set correct homePageConfig in getPageConfig', () => {
        component.homePageConfig = {};

        component.getPageConfig();

        expect(component.homePageConfig).toEqual(pageConfig);
    });

    it('should set correct featuredApp in getFeaturedApps', () => {
        component.featuredApp = [];

        component.getFeaturedApps();

        expect(component.featuredApp).toEqual(
            MockAppsService.MOCK_APPS_PAGE.list.map(app => new FullAppData(app, pageConfig.fieldMappings)),
        );
    });

    it('should set correct sidebarFilters in getSidebarFilters', () => {
        component.sidebarFilters = [];

        component.getSidebarFilters(MockFrontendService.MOCK_FILTERS_PAGE.list);

        expect(component.sidebarFilters).toEqual(MockFrontendService.MOCK_FILTERS_PAGE.list);
    });

    it('should set correct gallery in getAppsForFilters', () => {
        component.gallery = [];

        component.getAppsForFilters(MockFrontendService.MOCK_FILTERS_PAGE.list);

        const isAllItemsHaveData = component.gallery.every(item => item.data.length);

        expect(isAllItemsHaveData).toBeTruthy();
    });

    it('should not set gallery in getAppsForFilters if no filters passed', () => {
        component.gallery = [];

        component.getAppsForFilters([]);

        expect(component.gallery.length).toBe(0);
    });

    it('should set correct cmsData in initCMSData', () => {
        const namePathMap = {
            pageInfoTitle: 'big-hero.title',
            pageInfoSubtext: 'big-hero.subtext',
            bottomCalloutHeader: 'content-callout.title',
            bottomCalloutImageURL: 'content-callout.image',
            bottomCalloutDescription: 'content-callout.body',
            bottomCalloutButtonText: 'content-callout.button.text',
            bottomCalloutButtonLocation: 'content-callout.button.location',
        };

        component.cmsData = {
            pageInfoTitle: '',
            pageInfoSubtext: '',
            bottomCalloutHeader: '',
            bottomCalloutImageURL: '',
            bottomCalloutDescription: '',
            bottomCalloutButtonText: '',
            bottomCalloutButtonLocation: '',
        };

        component.initCMSData();

        Object.entries(namePathMap).forEach(([name, path]) => {
            expect(component.cmsData[name]).toBe(get(MockCmsContentService.CMS_DATA, path));
        });
    });

    it('should set correct categoriesData and categories in getCategoriesToExplore', () => {
        component.categoriesData = [];
        component.categories = [];

        component.homePageConfig.appListPage = [
            ...component.homePageConfig.appListPage,
            {
                name: 'Featured',
                description: '',
                type: 'filter-values-card-list',
                filter: '{"attributes.featured": "yes"}',
                filterId: 'collections',
                valueId: 'featured',
                sort: '{randomize: 1}',
            },
        ];

        component.getCategoriesToExplore(MockFrontendService.MOCK_FILTERS_PAGE.list);

        const collectionFilter = MockFrontendService.MOCK_FILTERS_PAGE.list.find(item => item.id === 'collections').values;
        expect(component.categoriesData.sort(sortById)).toEqual(collectionFilter.sort(sortById));

        const categoriesNames = component.categories.map(category => category.categoryName);
        const collectionFilterNames = collectionFilter.map(filter => filter.label);
        expect(categoriesNames.sort()).toEqual(collectionFilterNames.sort());
    });

    it('should not set categoriesData and categories in getCategoriesToExplore if appListPage with filter-values-card-list does not exist', () => {
        component.categoriesData = [];
        component.categories = [];

        component.homePageConfig.appListPage = component.homePageConfig.appListPage.map(app => ({ ...app, type: 'some-type' }));

        component.getCategoriesToExplore(MockFrontendService.MOCK_FILTERS_PAGE.list);

        expect(component.categoriesData.length).toBe(0);
        expect(component.categories.length).toBe(0);
    });

    it('should use cmsData in template', () => {
        const pageTitle = fixture.debugElement.query(By.css('.page-title')).nativeElement;
        const pageDescription = fixture.debugElement.query(By.css('.page-description')).nativeElement;
        const getStartedInstance = fixture.debugElement.query(By.directive(MockAppGetStartedComponent)).componentInstance;

        expect(pageTitle.textContent).toBe(component.cmsData.pageInfoTitle);
        expect(pageDescription.textContent).toBe(component.cmsData.pageInfoSubtext);
        expect(getStartedInstance.getStartedImage).toBe(component.cmsData.bottomCalloutImageURL);
        expect(getStartedInstance.getStartedHeader).toBe(component.cmsData.bottomCalloutHeader);
        expect(getStartedInstance.getStartedDescription).toBe(component.cmsData.bottomCalloutDescription);
        expect(getStartedInstance.getStartedButtonText).toBe(component.cmsData.bottomCalloutButtonText);
    });

    it('should render featured apps only if featuredApp is not empty', () => {
        component.featuredApp = [];
        fixture.detectChanges();

        const getStarted = fixture.debugElement.query(By.directive(MockFeaturedAppsComponent));
        expect(getStarted).toBeNull();
    });

    it('should pass featuredApp to featured apps', () => {
        component.getFeaturedApps();
        fixture.detectChanges();

        const getStartedInstance = fixture.debugElement.query(By.directive(MockFeaturedAppsComponent)).componentInstance;
        expect(getStartedInstance.data).toEqual(component.featuredApp);
    });

    it('should call goToBrowsePage oc-text-search emits enterSearch', () => {
        const ENTERED_TEXT = 'entered-text';
        component.goToBrowsePage = jest.fn();

        const textSearchDE = fixture.debugElement.query(By.directive(MockTextSearchComponent));
        textSearchDE.triggerEventHandler('enterSearch', ENTERED_TEXT);
        expect(component.goToBrowsePage).toHaveBeenCalledWith(
            (component as any).DEFAULT_FILTER_ID,
            (component as any).DEFAULT_FILTER_VALUE_ID,
            ENTERED_TEXT,
        );
    });

    it('goToBrowsePage should correctly navigate user', fakeAsync(() => {
        window.scrollTo = jest.fn();
        const ENTERED_TEXT = 'entered-text';
        const DEFAULT_FILTER_ID = (component as any).DEFAULT_FILTER_ID;
        const DEFAULT_FILTER_VALUE_ID = (component as any).DEFAULT_FILTER_VALUE_ID;

        router.navigate(['some-page']);
        tick();

        component.goToBrowsePage(DEFAULT_FILTER_ID, DEFAULT_FILTER_VALUE_ID, ENTERED_TEXT);
        tick();

        expect(router.url).toBe(`/browse/${DEFAULT_FILTER_ID}/${DEFAULT_FILTER_VALUE_ID}?search=${ENTERED_TEXT}`);
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    }));

    it('should set filterCollapsed when app-collapse-with-title emits collapseChanged', () => {
        component.filterCollapsed = false;

        const collapseWithTitleDE = fixture.debugElement.query(By.directive(MockCollapseWithTitleComponent));
        collapseWithTitleDE.triggerEventHandler('collapseChanged', true);

        expect(component.filterCollapsed).toBeTruthy();
    });

    it('should pass filterCollapsed to app-collapse-with-title and oc-sidebar', () => {
        const collapseWithTitleInstance = fixture.debugElement.query(By.directive(MockCollapseWithTitleComponent)).componentInstance;
        const sidebarInstance = fixture.debugElement.query(By.directive(MockSidebarComponent)).componentInstance;

        component.filterCollapsed = true;
        fixture.detectChanges();
        expect(collapseWithTitleInstance.collapsed).toBeTruthy();
        expect(sidebarInstance.ngbCollapse).toBeTruthy();

        component.filterCollapsed = false;
        fixture.detectChanges();
        expect(collapseWithTitleInstance.collapsed).toBeFalsy();
        expect(sidebarInstance.ngbCollapse).toBeFalsy();
    });

    it('should render filters according to sidebarFilters', () => {
        const sidebars = fixture.debugElement.queryAll(By.directive(MockSidebarComponent));
        const firstSidebarInstance = sidebars[0].componentInstance;
        const firstFilter = component.sidebarFilters[0];

        expect(firstSidebarInstance.baseNavigation).toBe(`browse/${firstFilter.id}`);
        expect(firstSidebarInstance.title).toBe(firstFilter.name);
        expect(firstSidebarInstance.sidebarModel).toEqual(firstFilter.values);
        expect(sidebars.length).toBe(component.sidebarFilters.length);
    });

    it('should render oc-app-categories if homePageConfig.appListPage has type filter-values-card-list', () => {
        component.homePageConfig.appListPage = [
            ...component.homePageConfig.appListPage,
            {
                name: 'Featured',
                description: '',
                type: 'filter-values-card-list',
                filter: '{"attributes.featured": "yes"}',
                filterId: 'collections',
                valueId: 'featured',
                sort: '{randomize: 1}',
            },
        ];
        component.getCategoriesToExplore(MockFrontendService.MOCK_FILTERS_PAGE.list);
        fixture.detectChanges();

        const appCategories = fixture.debugElement.query(By.directive(MockAppCategoriesComponent));
        expect(appCategories).toBeTruthy();
    });

    it('should not render oc-app-categories if categoriesData is empty', () => {
        component.categoriesData = [];
        fixture.detectChanges();

        const appCategories = fixture.debugElement.query(By.directive(MockAppCategoriesComponent));
        expect(appCategories).toBeNull();
    });

    it('should render oc-app-gallery according to gallery property', () => {
        const galleryList = fixture.debugElement.queryAll(By.directive(MockAppGalleryComponent));
        const firstGalleryItemInstance = galleryList[0].componentInstance;
        const firstGallery = component.gallery[0];

        expect(firstGalleryItemInstance.seeAllUrl).toEqual(['browse', firstGallery.filterId, firstGallery.valueId]);
        expect(firstGalleryItemInstance.appsArr).toBe(firstGallery.data);
        expect(firstGalleryItemInstance.appGalleryTitle).toBe(firstGallery.label);
        expect(firstGalleryItemInstance.appGalleryDescription).toBe(firstGallery.description);
        expect(galleryList.length).toBe(component.gallery.length);
    });

    it('should complete loader when appService.getApps throws error', fakeAsync(() => {
        jest.spyOn(component.loader, 'complete');
        (component as any).appService.getApps = () => throwError('Error');

        // Use try catch because getFeaturedApps throws error and tests are not passed
        try {
            component.getFeaturedApps();
            tick();
        } catch {}

        expect(component.loader.complete).toHaveBeenCalled();
    }));

    it('should complete loader when frontendService.getFilters throws error', fakeAsync(() => {
        jest.spyOn(component.loader, 'complete');
        (component as any).frontendService.getFilters = () => throwError('Error');

        component.getFilters();
        tick();

        expect(component.loader.complete).toHaveBeenCalled();
    }));
});
