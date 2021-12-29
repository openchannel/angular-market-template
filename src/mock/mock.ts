import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Page } from '@openchannel/angular-common-services';
import { Filter } from '@openchannel/angular-common-components';
import { get } from 'lodash';
import { throwObservableError } from './mock.utils';

@Component({
    selector: 'mock-routing',
    template: '',
})
export class MockRoutingComponent {}

@Component({
    selector: 'ngx-loading-bar',
    template: '',
})
export class MockNgxLoadingBarComponent {
    @Input() includeSpinner: boolean = false;
}

@Component({
    selector: 'app-notification',
    template: '',
})
export class MockNotificationComponent {}

export class MockPrerenderRequestsWatcherService {
    setPrerenderStatus(ready: boolean): void {}
    create404MetaTag(): void {}
    remove404MetaTag(): void {}
}

@Component({
    selector: 'oc-button',
    template: '',
})
export class MockButtonComponent {
    @Input() text: string = '';
    @Input() disabled: boolean = false;
    @Input() type: 'primary' | 'secondary' | 'link' = 'primary';
    @Input() customClass: string;
    @Input() style: string;
    @Input() process: boolean;
    @Input() customTemplate: TemplateRef<any>;
}

@Component({
    selector: 'oc-featured-apps',
    template: '',
})
export class MockFeaturedAppsComponent {
    @Input() data: any[] = [];
    @Input() label: string = 'Featured';
    @Input() headingTag: string = 'h2';
    @Input() appHeadingTag: string = 'h3';
    @Input() emptyDataMessage: string = 'No Featured App';
    @Input() customClasses: string = '';
    @Input() customFeaturedAppCardTemplate: TemplateRef<any>;
    @Input() mainRouterLink: string = '';
    @Input() navigationParam: string;
}

@Component({
    selector: 'oc-text-search',
    template: '',
})
export class MockTextSearchComponent {
    @Input() clearAllButtonType: string = 'link';
    @Input() showClearAllTagsButton: boolean = true;
    @Input() searchText: string;
    @Input() placeHolder: string = 'Search';
    @Input() hasMagnifier: boolean = true;
    @Input() hasClearTextControl: boolean = false;
    @Input() clearButtonText: string = 'Clear';
    @Input() searchButtonText: string = 'Search';
    @Input() clearTagsButtonText: string = 'Clear all';
    @Input() tagsTitles: string[] = [];
    @Output() readonly searchTextChange: EventEmitter<string> = new EventEmitter();
    @Output() readonly enterSearch: EventEmitter<string> = new EventEmitter<string>();
    @Output() readonly tagDeleted: EventEmitter<number> = new EventEmitter<number>();
    @Output() readonly allTagsDeleted: EventEmitter<void> = new EventEmitter<void>();
}

@Component({
    selector: 'app-collapse-with-title',
    template: '',
})
export class MockCollapseWithTitleComponent {
    @Input() titleForClose: string;
    @Input() titleForOpen: string;
    @Input() collapsed = true;
    @Output() readonly collapseChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
}

@Component({
    selector: 'oc-sidebar',
    template: '',
})
export class MockSidebarComponent {
    @Input() title: string;
    @Input() titleHeadingTag: string = 'h2';
    @Input() sidebarModel: any;
    @Input() toggleIconDown: string = '';
    @Input() toggleIconUp: string = '';
    @Input() baseNavigation: string;
    @Input() threshold: number = 10;
    @Input() expandText: string = 'Show more';
    @Input() collapseText: string = 'Show less';
    @Input() toggleListButtonType: 'primary' | 'link' = 'link';
    @Input() ngbCollapse: any;
    @Output() readonly sidebarChange: EventEmitter<any> = new EventEmitter<any>();
}

@Component({
    selector: 'oc-app-categories',
    template: '',
})
export class MockAppCategoriesComponent {
    @Input() data: any[] = [];
    @Input() categoryHeaderTitle: string = '';
    @Input() categoryRouterLink: string = '';
}

@Component({
    selector: 'oc-app-gallery',
    template: '',
})
export class MockAppGalleryComponent {
    @Input() appsArr: any[] = [];
    @Input() noAppMessage: string = '';
    @Input() moreAppsTitle: string = 'More';
    @Input() appGalleryTitle: string = '';
    @Input() appGalleryDescription: string = '';
    @Input() routerIcon: string = '';
    @Input() customAppCardTemplate: TemplateRef<any>;
    @Input() seeAllUrl: string | any[];
    @Input() routerLinkForOneApp: string;
    @Input() appNavigationParam: string = 'appId';
    @Input() headingTag: string = 'h2';
    @Output() readonly clickMoreApps: EventEmitter<void> = new EventEmitter<void>();
}

@Component({
    selector: 'oc-app-get-started',
    template: '',
})
export class MockAppGetStartedComponent {
    @Input() getStartedImage: string = '';
    @Input() getStartedHeader: string = 'List Your App in our App Store';
    @Input() getStartedHeadingTag: string = 'h3';
    @Input() getStartedDescription: string = '';
    @Input() getStartedButtonText: string = '';
    @Input() getStartedType: 'home' | 'search' = 'home';
    @Output() readonly getStarted: EventEmitter<void> = new EventEmitter<void>();
}

export class MockLoadingBarState {
    complete(): void {}
    start(): void {}
    stop(): void {}
}

export class MockLoadingBarService {
    useRef(): MockLoadingBarState {
        return new MockLoadingBarState();
    }
}

export class MockAppsService {
    static THROW_ERRORS = false;

    static MOCK_APP = {
        allow: {},
        access: [],
        created: 1639656082091,
        rating: 425,
        restrict: {},
        submittedDate: 1639656081882,
        type: 'downloadable',
        version: 1,
        lastUpdated: 1639656081714,
        name: 'API Plus Connect',
        attributes: {},
        customData: {
            summary: '',
            images: [],
            description: '',
            categories: ['Developer Tools', 'File Management'],
        },
        developerId: 'erp-above',
        isLive: true,
        reviewCount: 2,
        appId: '61bb2a918e9d83275b715c7b',
        model: [
            {
                license: 'single',
                modelId: '61bb2a918e9d83275b715c79',
                price: 0,
                currency: 'USD',
                modelType: null,
                type: 'free',
                trial: 0,
            },
        ],
        safeName: ['api-plus-connect'],
        status: {
            lastUpdated: 1639656081951,
            reason: '',
            modifiedBy: 'administrator',
            value: 'approved',
        },
    };

    static MOCK_APPS_PAGE = {
        count: 1,
        pages: 1,
        pageNumber: 1,
        list: [MockAppsService.MOCK_APP, MockAppsService.MOCK_APP, MockAppsService.MOCK_APP],
    };

    @throwObservableError(() => MockAppsService.THROW_ERRORS) getApps(): Observable<any> {
        return of(MockAppsService.MOCK_APPS_PAGE);
    }
}

export class MockCmsContentService {
    static CMS_DATA = {
        site: {
            title: 'App Directory',
            favicon: 'assets/img/favicon.png',
        },
        'default-header': {
            logo: 'assets/img/logo-company.png',
            menu: {
                items: [
                    {
                        label: 'Browse',
                        location: '',
                    },
                    {
                        label: 'My apps',
                        location: 'my-apps',
                    },
                ],
            },
        },
        'big-hero': {
            title: 'Your App Directory',
            subtext: 'A default design template for implementing your app directory with OpenChannel',
        },
        'content-callout': {
            title: 'List your app in our app directory',
            body: 'Register as an app developer and submit your app easily with our Developer Portal',
            button: {
                text: 'Get started as an app developer',
                location: '',
            },
            image: 'assets/img/get-started.svg',
        },
        'default-footer': {
            menu: {
                items: [
                    {
                        label: '',
                        location: '',
                        items: [
                            {
                                label: '',
                                location: '',
                            },
                        ],
                    },
                ],
            },
            logo: 'assets/img/logo-company.png',
        },
        login: {
            logo: 'assets/img/logo-company.png',
        },
    };

    getContentDefault(): any {
        return MockCmsContentService.CMS_DATA;
    }

    getContentFromAPI(): Observable<any> {
        return of(MockCmsContentService.CMS_DATA);
    }

    getContentByPaths(paths: any): Observable<any> {
        Object.entries(paths).forEach(([name, path]) => {
            paths[name] = get(MockCmsContentService.CMS_DATA, path);
        });

        return of(paths);
    }
}

export class MockFrontendService {
    static THROW_ERRORS = false;

    static MOCK_FILTER_VALUE = {
        id: 'allApps',
        label: 'All Apps',
        sort: '{"randomize":1}',
        description: 'All applications are listed here..',
        query: '{"status.value":"approved"}',
        checked: false,
    };

    static MOCK_FILTERS_PAGE: Page<Filter> = {
        count: 1,
        pageNumber: 1,
        pages: 1,
        list: [
            {
                id: 'collections',
                name: 'Collections',
                description: '',
                values: [
                    MockFrontendService.MOCK_FILTER_VALUE,
                    { ...MockFrontendService.MOCK_FILTER_VALUE, id: 'featured' },
                    { ...MockFrontendService.MOCK_FILTER_VALUE, id: 'popular' },
                    { ...MockFrontendService.MOCK_FILTER_VALUE, id: 'newest' },
                ],
            },
            {
                id: 'categories',
                name: 'Categories',
                description: '',
                values: [
                    { ...MockFrontendService.MOCK_FILTER_VALUE, id: 'analytics' },
                    { ...MockFrontendService.MOCK_FILTER_VALUE, id: 'communication' },
                    { ...MockFrontendService.MOCK_FILTER_VALUE, id: 'customer-support' },
                ],
            },
        ],
    };

    @throwObservableError(() => MockFrontendService.THROW_ERRORS) getFilters(): Observable<any> {
        return of(MockFrontendService.MOCK_FILTERS_PAGE);
    }
}

export class MockSiteConfigService {
    static PAGE_CONFIG = {
        title: 'string',
        tagline: 'string',
        metaTags: [],
        favicon: {
            href: 'string',
            type: 'string',
        },
    };

    getSiteConfigAsObservable(): Observable<any> {
        return of(MockSiteConfigService.PAGE_CONFIG);
    }

    initSiteConfiguration(config: any): void {}
}

export class MockTitleService {
    setSpecialTitle(): void {}
}

export class MockAuthenticationService {
    static THROW_ERRORS = false;

    @throwObservableError(() => MockAuthenticationService.THROW_ERRORS) tryLoginByRefreshToken(): Observable<any> {
        return of('1');
    }

    @throwObservableError(() => MockAuthenticationService.THROW_ERRORS) initCsrf(): Observable<any> {
        return of('1');
    }
}
