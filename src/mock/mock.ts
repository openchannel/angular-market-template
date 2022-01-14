import { Component, Directive, EventEmitter, Input, Output, Pipe, PipeTransform, TemplateRef } from '@angular/core';
import { asyncScheduler, Observable, of } from 'rxjs';
import { Page, Permission, SortResponse, Transaction } from '@openchannel/angular-common-services';
import { Filter } from '@openchannel/angular-common-components';
import { get } from 'lodash';
import { observeOn } from 'rxjs/operators';

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

    getApps(): Observable<any> {
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

    static MOCK_SORTS_PAGE: Page<SortResponse> = {
        count: 1,
        list: [
            {
                id: 'en-us-1',
                name: 'en-us 1',
                description: 'en-us 1 Description',
                values: [
                    {
                        id: '1-start',
                        label: 'Popular',
                        sort: '{"created":-1}',
                        customData: null,
                        description: 'fghfg',
                        checked: false,
                    },
                    {
                        id: 'newest',
                        label: 'Newest',
                        sort: '{"created":-1}',
                        customData: null,
                        description: 'fgdg dfg',
                        checked: false,
                    },
                ],
            },
        ],
        pageNumber: 1,
        pages: 1,
    };

    getFilters(): Observable<any> {
        return of(MockFrontendService.MOCK_FILTERS_PAGE);
    }

    getSorts(): Observable<any> {
        return of(MockFrontendService.MOCK_SORTS_PAGE);
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
    tryLoginByRefreshToken(): Observable<any> {
        return of('1');
    }

    initCsrf(): Observable<any> {
        return of('1');
    }
}

@Component({
    selector: 'oc-dropdown',
    template: '',
})
export class MockDropdownComponent {
    @Input() selected: any;
    @Input() title: string = 'Sort by';
    @Input() options: any[];
    @Output() readonly selectedChange: EventEmitter<any> = new EventEmitter<any>();
}

@Component({
    selector: 'oc-app-short-info',
    template: '',
})
export class MockAppShortInfoComponent {
    @Input() app: any;
    @Input() priceModelIndex: number = 0;
    @Input() customDropdown: TemplateRef<any>;
    @Input() defaultAppIcon: string = 'assets/angular-common-components/standard-app-icon.svg';
    @Output() readonly clickByAppCard: EventEmitter<any> = new EventEmitter<any>();
}

@Directive({
    selector: 'infiniteScroll',
})
export class MockInfiniteScrollDirective {
    @Output() readonly scrolled: EventEmitter<any> = new EventEmitter<any>();
}

@Directive({
    selector: 'ngbDropdown',
})
export class MockNgbDropdownDirective {
    @Input() placement: string = '';
}

@Directive({
    selector: 'ngbDropdownToggle',
})
export class MockNgbDropdownToggleDirective {}

@Directive({
    selector: 'ngbDropdownMenu',
})
export class MockNgbDropdownMenuDirective {}

@Directive({
    selector: 'ngbDropdownItem',
})
export class MockNgbDropdownItemDirective {}

export class MockNgbModalRef {
    result = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
    });
    resolve: any;
    reject: any;

    componentInstance: any = {};

    dismiss(): void {
        this.removeActiveModal();
        this.reject();
    }

    close(): void {
        this.removeActiveModal();
        this.resolve();
    }

    private removeActiveModal(): void {
        MockNgbModal.ACTIVE_MODALS.pop();
    }
}

export class MockNgbModal {
    static ACTIVE_MODALS: MockNgbModalRef[] = [];

    open(): any {
        const newModal = new MockNgbModalRef();
        MockNgbModal.ACTIVE_MODALS.push(newModal);
        return newModal;
    }
}

export class MockToastrService {
    success(): void {}
    error(): void {}
}

export class MockAuthHolderService {
    static MOCK_HAS_ANY_PERMISSION_RESPONSE = true;

    hasAnyPermission(): boolean {
        return MockAuthHolderService.MOCK_HAS_ANY_PERMISSION_RESPONSE;
    }
}

export class MockUserRoleService {
    static MOCK_USER_ROLES_PAGE = {
        count: 5,
        pages: 1,
        pageNumber: 1,
        list: [
            {
                userRoleId: 'user-admin',
                name: 'Admin',
                systemDefined: true,
                created: 1614286695577,
                lastUpdated: 1614286695577,
                permissions: [
                    'ORGANIZATIONS.READ',
                    'ORGANIZATIONS.MODIFY',
                    'OWNERSHIPS.READ',
                    'OWNERSHIPS.MODIFY',
                    'REVIEWS.READ',
                    'REVIEWS.CREATE',
                    'REVIEWS.MODIFY',
                    'ACCOUNTS.READ',
                    'ACCOUNTS.MODIFY',
                    'ACCOUNTS.DELETE',
                    'FILES.READ',
                    'FILES.MODIFY',
                    'APPS.READ',
                    'FORMS.READ',
                    'FORM_SUBMISSIONS.READ',
                    'FORM_SUBMISSIONS.MODIFY',
                    'REQUESTS.READ',
                    'REQUESTS.CREATE',
                    'REQUESTS.MODIFY',
                    'REQUESTS.DELETE',
                    'REQUESTS.MODERATE',
                    'REVIEWS.DELETE',
                ],
            },
            {
                userRoleId: 'user-viewer',
                created: 1614286695577,
                lastUpdated: 1614286695577,
                name: 'Viewer',
                permissions: [
                    'ORGANIZATIONS.READ',
                    'OWNERSHIPS.READ',
                    'REVIEWS.READ',
                    'ACCOUNTS.READ',
                    'FILES.READ',
                    'APPS.READ',
                    'FORMS.READ',
                    'FORM_SUBMISSIONS.READ',
                    'REQUESTS.READ',
                ],
                systemDefined: true,
            },
            {
                userRoleId: 'user-custom_user',
                name: 'custom_user',
                systemDefined: false,
                created: 1614685629236,
                lastUpdated: 1627454502249,
                permissions: [
                    'APPS.READ',
                    'REVIEWS.DELETE',
                    'REQUESTS.READ',
                    'REQUESTS.CREATE',
                    'REQUESTS.MODIFY',
                    'REQUESTS.MODERATE',
                    'REQUESTS.DELETE',
                    'OWNERSHIPS.READ',
                    'OWNERSHIPS.MODIFY',
                    'ORGANIZATIONS.READ',
                    'ACCOUNTS.READ',
                    'FILES.READ',
                    'FILES.MODIFY',
                    'FORMS.READ',
                    'FORM_SUBMISSIONS.READ',
                    'FORM_SUBMISSIONS.MODIFY',
                ],
            },
            {
                userRoleId: 'user-review-permissions',
                name: 'Review Permissions',
                systemDefined: false,
                created: 1625816708480,
                lastUpdated: 1627017170171,
                permissions: [
                    'APPS.CREATE',
                    'REVIEWS.READ',
                    'REVIEWS.CREATE',
                    'REVIEWS.MODIFY',
                    'REVIEWS.DELETE',
                    'REQUESTS.CREATE',
                    'REQUESTS.MODIFY',
                    'REQUESTS.MODERATE',
                    'REQUESTS.DELETE',
                    'OWNERSHIPS.CREATE',
                    'OWNERSHIPS.MODIFY',
                    'ORGANIZATIONS.CREATE',
                    'ORGANIZATIONS.MODIFY',
                    'ACCOUNTS.CREATE',
                    'ACCOUNTS.MODIFY',
                    'ACCOUNTS.DELETE',
                    'FILES.CREATE',
                    'FILES.MODIFY',
                    'FORMS.CREATE',
                    'FORM_SUBMISSIONS.CREATE',
                    'FORM_SUBMISSIONS.MODIFY',
                ],
            },
            {
                userRoleId: 'user-form-submission-modify',
                name: 'Form Submission Modify',
                systemDefined: false,
                created: 1635164714417,
                lastUpdated: 1637575016675,
                permissions: ['ACCOUNTS.READ', 'FILES.READ', 'FORMS.READ', 'FORM_SUBMISSIONS.READ'],
            },
        ],
    };

    getUserRoles(): Observable<any> {
        return of(MockUserRoleService.MOCK_USER_ROLES_PAGE);
    }
}

export class MockInviteUserService {
    sendUserInvite(): Observable<any> {
        return of(1);
    }
}

export class MockUsersService {
    static MOCK_USER_COMPANY_RESPONSE = {
        userId: '644d352b-7be2-4b3e-8ee3-967f89d2bef0',
        accountCount: 1,
        created: 1640798413377,
        customData: {},
        name: 'weyen25008@ehstock.com',
        type: 'default',
        ownedApps: [
            {
                appId: '600eef7a7ec0f53371d1caab',
                userId: '644d352b-7be2-4b3e-8ee3-967f89d2bef0',
                date: 1640798459500,
                developerId: '49f5edfb-d7c0-46a5-800c-b371e00840e4',
                expires: 1643476998869,
                model: {
                    license: 'single',
                    feePayer: 'marketplace',
                    billingPeriod: 'monthly',
                    modelId: '600eef7a7ec0f53371d1caa9',
                    price: 400,
                    commission: 0,
                    currency: 'USD',
                    modelType: null,
                    type: 'recurring',
                    trial: 0,
                    billingPeriodUnit: 1,
                },
                ownershipId: '61cc98fb2d13e52f69319dc4',
                ownershipStatus: 'cancelled',
                ownershipType: 'subscription',
                productKey: '60UF0-NSKZP-U5C2H-8Z1P6-2D8Q5',
                trialType: null,
                type: null,
            },
        ],
    };

    static MOCK_USER_TYPE_DEFINITION_RESPONSE = {
        userTypeId: 'default',
        createdDate: 1614619741673,
        description: null,
        label: 'Default',
        fields: [
            {
                attributes: {
                    maxChars: null,
                    required: true,
                    minChars: null,
                },
                id: 'name',
                label: 'Company',
                type: 'text',
            },
        ],
    };

    getUserCompany(): Observable<any> {
        return of(MockUsersService.MOCK_USER_COMPANY_RESPONSE);
    }

    getUserTypeDefinition(): Observable<any> {
        return of(MockUsersService.MOCK_USER_TYPE_DEFINITION_RESPONSE);
    }

    updateUserCompany(): Observable<any> {
        return of(1).pipe(observeOn(asyncScheduler));
    }
}

@Component({
    selector: 'app-page-title',
    template: '',
})
export class MockPageTitleComponent {
    @Input() pageTitle: string;
    @Input() navigateText: string;
    @Input() buttonText: string;
    @Output() readonly navigateClick: EventEmitter<void> = new EventEmitter<void>();
    @Output() readonly buttonClick: EventEmitter<void> = new EventEmitter<void>();
}

@Component({
    selector: 'app-company-details',
    template: '',
})
export class MockCompanyDetailsComponent {}

@Component({
    selector: 'app-management',
    template: '',
})
export class MockManagementComponent {}

export class MockModalInviteUserModel {}

@Component({
    selector: 'oc-invite-modal',
    template: '',
})
export class MockInviteModalComponent {
    @Input() modalData: any;
    @Input() formId: any = null;
    formConfig: any = {};
    formGroup: any;
    formData: any;
    inProcess = false;
}

@Directive({
    selector: '[appPermissions]',
})
export class MockPermissionDirective {
    @Input('appPermissions') permission: Permission[];
}

@Component({
    selector: 'oc-form',
    template: '',
})
export class MockFormComponent {
    @Input() formJsonData: any;
    @Input() showButton: boolean = true;
    @Input() buttonPosition: 'center' | 'left' | 'right' | 'justify' = 'left';
    @Input() successButtonText: string = 'Submit';
    @Input() labelPosition: 'top' | 'left' | 'right' = 'top';
    @Input() process: boolean = false;
    @Input() generatedForm: any;
    @Output() readonly formSubmitted: EventEmitter<any> = new EventEmitter();
    @Output() readonly cancelSubmit: EventEmitter<void> = new EventEmitter();
    @Output() readonly formDataUpdated: EventEmitter<any> = new EventEmitter();
    @Output() readonly isFormInvalid: EventEmitter<boolean> = new EventEmitter();
    @Output() readonly createdForm: EventEmitter<any> = new EventEmitter();
    @Input() displayType: any = 'page';
    @Input() additionalButton: TemplateRef<any>;
    @Input() currentStep: number = 1;
    @Input() maxStepsToShow: number = 0;
    @Input() formId: any = null;
    @Output() readonly currentStepChange = new EventEmitter<number>();
    @Input() showSubmitButton: boolean = true;
    @Input() showGroupHeading: boolean = true;
    @Input() showGroupDescription: boolean = true;
    @Input() showProgressBar: boolean = true;
    @Input() setFormErrors: boolean = false;
}

export class MockTypeMapperUtils {
    static injectDefaultValues(): any {
        return [];
    }

    static normalizeOptions(): any {
        return [];
    }

    static buildDataForSaving(): any {
        return {};
    }

    static createFormConfig(): any {
        return {};
    }

    static mergeTwoData(): any {
        return {};
    }
}

@Component({
    selector: 'oc-app-table',
    template: '',
})
export class MockAppTableComponent {
    @Input() properties: any;
    @Input() noAppMessage: string = 'You have no apps in your list';
    @Input() menuUrl: string = 'assets/angular-common-components/dots-menu.svg';
    @Input() ascendingSortIcon: string = '';
    @Input() descendingSortIcon: string = '';
    @Input() defaultAppIcon: string = '';
    @Input() activeColumns: any[] = [];
    @Input() modifyColumns: any = {};
    @Input() sortOptions: any;
    @Input() tableBottomRowTemplate: TemplateRef<any>;
    @Input() selectAppFieldByPathConfig: any;
    @Output() readonly menuClicked: EventEmitter<any> = new EventEmitter<any>();
    @Output() readonly pageScrolled: EventEmitter<number> = new EventEmitter<number>();
    @Output() readonly sortChosen: EventEmitter<any> = new EventEmitter<any>();
    @Output() readonly sortOptionsChosen: EventEmitter<any> = new EventEmitter<any>();
}

@Pipe({
    name: 'transactionAmount',
})
export class MockTransactionAmountPipe implements PipeTransform {
    transform(s: string): string {
        return s;
    }
}

export class MockTransactionsService {
    static MOCK_TRANSACTION: Transaction = {
        transactionId: '61d4035a8ebc4e5af2cfdbc6',
        ownershipId: '61d403278ebc4e5af2cfdbb2',
        appId: '61d402ef8ebc4e5af2cfdba2',
        userId: '644d352b-7be2-4b3e-8ee3-967f89d2bef0',
        developerId: '34df9c9f-9257-4334-9462-93d70393a9f3',
        date: 1641284441000,
        invoiceUrl:
            'https://pay.stripe.com/invoice/acct_1KC5ZkC6zKuu5PJY/test_YWNjdF8xS0M1WmtDNnpLdXU1UEpZLF9LdHc4OHhwb1Z4RmU5NERwM2VocFQzaFBGY3FLTGJ30100Zn7mRDfy/pdf',
        recieptUrl:
            'https://pay.stripe.com/receipts/acct_1KC5ZkC6zKuu5PJY/ch_3KE8G4C6zKuu5PJY0QOxir37/rcpt_Ktw8UTDAHQRegzIZK3cqLjGLtVe81Dn',
        amount: 300,
        feeAmount: 39,
        marketplaceAmount: 0,
        developerAmount: 261,
        type: 'payment',
    };
    static MOCK_TRANSACTIONS_LIST = {
        count: 2,
        pages: 1,
        pageNumber: 1,
        list: [{ ...MockTransactionsService.MOCK_TRANSACTION }],
    };

    getTransactionsList(): Observable<any> {
        return of(MockTransactionsService.MOCK_TRANSACTIONS_LIST);
    }
}
