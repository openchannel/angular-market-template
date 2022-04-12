import { Component, Directive, EventEmitter, Input, Output, Provider, Pipe, PipeTransform, TemplateRef } from '@angular/core';
import { asyncScheduler, Observable, of, Subject } from 'rxjs';
import {
    Page,
    Permission,
    SortResponse,
    UserAccountService,
    Transaction,
    InviteUserService,
    UserAccount,
    UserRoleService,
    UsersService,
} from '@openchannel/angular-common-services';
import {
    ComponentsUserActivationModel,
    ComponentsUserGridActionModel,
    ComponentsUsersGridParametersModel,
    ErrorMessageFormId,
    Filter,
    HeadingTag,
    ModalInviteUserModel,
    ModalUpdateUserModel,
    SocialLink,
    SortField,
    UserGridSortOrder,
    UserSortChosen,
} from '@openchannel/angular-common-components';
import { get } from 'lodash';
import { observeOn } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { InviteUserModel } from '@openchannel/angular-common-services/lib/model/api/invite-user.model';
import { Router } from '@angular/router';

class MockPagination<T> {
    private values: T[];
    constructor(values: T[]) {
        this.values = values || [];
    }
    getByPaginate(page: number, size: number): Page<T> {
        const normalizedPageNumber = page || 1; // min page number is 1
        const normalizedSizeNumber = size || 100; // max page size is 100

        let result: T[];
        if (normalizedPageNumber === 1) {
            result = this.values.slice(0, normalizedSizeNumber);
        } else {
            result = this.values.slice(
                normalizedPageNumber * normalizedSizeNumber - 1,
                (normalizedPageNumber + 1) * normalizedSizeNumber - 1,
            );
        }

        return {
            count: this.values.length,
            list: result,
            pages: Math.ceil(this.values.length / normalizedSizeNumber),
            pageNumber: normalizedPageNumber,
        };
    }
}

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
    setPrerenderStatus(ready: boolean): void {
        // do nothing.
    }
    create404MetaTag(): void {
        // do nothing.
    }
    remove404MetaTag(): void {
        // do nothing.
    }
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
    @Output() readonly click: EventEmitter<void> = new EventEmitter<void>();
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
    selector: 'oc-profile-navbar',
    template: '',
})
export class MockOcProfileNavbar {
    @Input() username: string;
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

@Component({
    selector: 'oc-activation',
    template: '',
})
export class MockOcActivationComponent {
    @Input() resendActivationUrl: any;
    @Input() signupUrl: any;
    @Input() companyLogoUrl: string = '';
    @Input() process: boolean = false;
    @Input() activationModel: ComponentsUserActivationModel;
    @Output() readonly buttonClick: EventEmitter<any> = new EventEmitter<any>();
    @Input() headingTag: HeadingTag = 'h1';
}

@Component({
    selector: 'oc-menu-user-grid',
    template: '',
})
export class MockOcMenuUserGridComponent {
    @Input() properties: ComponentsUsersGridParametersModel;
    @Input() menuUrl: string = 'assets/angular-common-components/dots-menu.svg';
    @Input() sortIcon: string;
    @Input() sortOptions: UserGridSortOrder;
    @Output() readonly menuClicked: EventEmitter<ComponentsUserGridActionModel> = new EventEmitter<ComponentsUserGridActionModel>();
    @Output() readonly pageScrolled: EventEmitter<number> = new EventEmitter<number>();
    @Output() readonly sortChosen: EventEmitter<SortField> = new EventEmitter<SortField>();
    @Output() readonly sortOptionsChosen: EventEmitter<UserSortChosen> = new EventEmitter<UserSortChosen>();
}

@Component({
    selector: 'oc-invite-modal',
    template: '',
})
export class MockOcInviteModalComponent {
    @Input() modalData: ModalInviteUserModel | ModalUpdateUserModel;
    @Input() formId: ErrorMessageFormId = null;
}

@Component({
    selector: 'oc-confirmation-modal',
    template: '',
})
export class OcConfirmationModalComponent {
    @Input() modalTitle: string = '';
    @Input() modalText: string = '';
    @Input() confirmButtonText: string = 'Ok';
    @Input() confirmButtonType: 'primary' | 'secondary' | 'link' | 'danger' = 'primary';
    @Input() confirmButtonHide: boolean = false;
    @Input() rejectButtonText = 'No, cancel';
    @Input() rejectButtonType: 'primary' | 'secondary' | 'link' | 'danger' = 'secondary';
    @Input() rejectButtonHide: boolean = false;
    @Input() confirmButtonClass: string = '';
}

export class MockLoadingBarState {
    complete(): void {
        // do nothing.
    }
    start(): void {
        // do nothing.
    }
    stop(): void {
        // do nothing.
    }
}

export class MockLoadingBarService {
    useRef(): MockLoadingBarState {
        return new MockLoadingBarState();
    }
}
@Component({
    selector: 'svg-icon',
    template: '',
})
export class MockSvgIconComponent {
    @Input() src: string;
    @Input() svgClass: string;
    @Input() ngbTooltip: string;
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
        values: [],
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

    initSiteConfiguration(config: any): void {
        // do nothing.
    }
}

export class MockTitleService {
    setSpecialTitle(): void {
        // do nothing.
    }
}

export class MockAuthenticationService {
    tryLoginByRefreshToken(): Observable<any> {
        return of('1');
    }

    initCsrf(): Observable<any> {
        return of('1');
    }

    getAuthConfig(): Observable<any> {
        return of({});
    }

    verifyCode(...args: any): Observable<any> {
        return of({});
    }

    login(...args: any): Observable<any> {
        return of({}).pipe(observeOn(asyncScheduler));
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
    success(): void {
        // do nothing.
    }
    error(): void {
        // do nothing.
    }
}

export class MockAuthHolderService {
    static MOCK_HAS_ANY_PERMISSION_RESPONSE = true;
    readonly REFRESH_TOKEN_KEY = 'refreshToken';

    userDetails = {
        isSSO: false,
    };

    hasAnyPermission(): boolean {
        return MockAuthHolderService.MOCK_HAS_ANY_PERMISSION_RESPONSE;
    }

    persist(...args: any): void {
        // do nothing
    }

    isLoggedInUser(...args: any): boolean {
        return true;
    }

    refreshToken(): string {
        return this.REFRESH_TOKEN_KEY;
    }
}

export class MockUserRoleService {
    static ADMIN_ROLE_ID = 'user-admin';
    static ADMIN_ROLE_NAME = 'Admin';

    static MOCK_USER_ROLES_PAGE = {
        count: 5,
        pages: 1,
        pageNumber: 1,
        list: [
            {
                userRoleId: MockUserRoleService.ADMIN_ROLE_ID,
                name: MockUserRoleService.ADMIN_ROLE_NAME,
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
    userInvites: MockPagination<InviteUserModel>;

    constructor(userInvites?: InviteUserModel[]) {
        this.userInvites = new MockPagination<InviteUserModel>(userInvites);
    }

    sendUserInvite(): Observable<any> {
        return of(1);
    }

    deleteUserInvite(inviteId: string): Observable<any> {
        return of({});
    }

    getUserInvites(pageNumber?: number, limit?: number, sort?: string, query?: string): Observable<Page<InviteUserModel>> {
        return of(this.userInvites.getByPaginate(pageNumber, limit));
    }
}

export class MockUserAccountService {
    currentUserAccount: UserAccount;
    otherUserAccounts: MockPagination<UserAccount>;

    constructor(currentUserAccount: UserAccount, otherUserAccounts: UserAccount[]) {
        this.currentUserAccount = currentUserAccount;
        this.otherUserAccounts = new MockPagination([currentUserAccount, ...(otherUserAccounts || [])]);
    }

    getUserAccount(): Observable<UserAccount> {
        return of(this.currentUserAccount);
    }

    getUserAccounts(pageNumber?: number, limit?: number, sort?: string, query?: string): Observable<Page<UserAccount>> {
        return of(this.otherUserAccounts.getByPaginate(pageNumber, limit));
    }

    updateUserAccountFieldsForAnotherUser(userAccountId: string, skipTypeValidation: boolean, body: any): Observable<UserAccount> {
        return of({} as UserAccount);
    }

    updateUserAccount(accountData: any): Observable<any> {
        return of('1').pipe(observeOn(asyncScheduler));
    }

    deleteUserAccount(userAccountId: string): Observable<any> {
        return of({});
    }

    deleteCurrentUserAccount(): Observable<any> {
        return of({});
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
    selector: 'oc-reset-password',
    template: '',
})
export class MockOcResetPasswordComponent {
    @Input() companyLogoUrl: any;
    @Input() process: any;
    @Input() loginUrl: any;
    @Input() signupUrl: any;
    @Output() readonly buttonClick: EventEmitter<any> = new EventEmitter<any>();
    @Input() resetModel: any;
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
    selector: 'oc-forgot-password',
    template: '',
})
export class MockOcForgotPasswordComponent {
    @Input() loginUrl: any;
    @Input() signupUrl: any;
    @Input() showResultPage: any;
    @Input() forgotPasswordDoneUrl: any;
    @Input() companyLogoUrl: any;
    @Input() process: any;
    @Input() loginModel: any;
    @Output() buttonClick: EventEmitter<any> = new EventEmitter<any>();
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
    selector: 'oc-signup-custom',
    template: '',
})
export class MockSignupCustom {
    @Input() loginUrl: string;
    @Input() signupUrl: string;
    @Input() activationUrl: string;
    @Input() termsUrl: string;
    @Input() policyUrl: string;
    @Input() companyLogoUrl: string;
    @Input() process: boolean = false;
    @Input() forgotPasswordDoneUrl: string;
    @Input() showSignupFeedbackPage: boolean = false;
    @Input() showLoginLink: boolean = true;
    @Input() formConfigsLoading: boolean = true;
    @Input() formConfigs: any[];
    @Input() defaultTypeLabelText = 'Type';
    @Input() customTermsDescription: TemplateRef<any>;
    @Input() headingTag: string = 'h1';
    @Input() headingInvitationText: string = 'Enter your personal details below';
    @Input() formId: any = 'signupCustom';
    @Input() customFormTemplate: TemplateRef<any>;
    @Output() readonly showSignupFeedbackPageChange = new EventEmitter<boolean>();
    @Output() readonly resultUserData = new EventEmitter<any>();
}

@Component({
    selector: 'oc-resend-activation',
    template: '',
})
export class MockResendActivation {
    @Input() activationModel: any;
    @Input() loginUrl: string;
    @Input() signupUrl: string;
    @Input() companyLogoUrl: string;
    @Input() process: boolean = false;
    @Output() readonly buttonClick = new EventEmitter<any>();
}

export class MockNativeLoginService {
    signup(): Observable<any> {
        return of('1').pipe(observeOn(asyncScheduler));
    }

    changePassword(): Observable<any> {
        return of('1').pipe(observeOn(asyncScheduler));
    }

    sendActivationCode(): Observable<any> {
        return of('1').pipe(observeOn(asyncScheduler));
    }

    signIn(...args: any): Observable<any> {
        return of({});
    }

    activate(): Observable<any> {
        return of(null).pipe(observeOn(asyncScheduler));
    }

    resetPassword(): Observable<any> {
        return of('1').pipe(observeOn(asyncScheduler));
    }
    sendResetCode(): Observable<any> {
        return of('1').pipe(observeOn(asyncScheduler));
    }
}
export class MockNgbActiveModal {
    close(...args: any): void {
        // do nothing
    }
}
export class MockEditUserTypeService {
    static MOCK_FORM_CONFIGS_RESPONSE = [
        {
            name: 'Default',
            organization: {
                type: 'default',
                typeData: {
                    userTypeId: 'default',
                    fields: [
                        {
                            attributes: {
                                required: false,
                            },
                            id: 'name',
                            label: 'Company Name',
                            type: 'text',
                        },
                    ],
                    createdDate: 1639656055769,
                    description: '',
                    label: 'Default',
                },
                includeFields: ['name', 'customData.company'],
            },
            account: {
                type: 'default',
                typeData: {
                    fields: [
                        {
                            attributes: {
                                required: false,
                            },
                            id: 'name',
                            label: 'Name',
                            type: 'text',
                        },
                        {
                            attributes: {
                                required: true,
                            },
                            id: 'email',
                            label: 'Email',
                            type: 'emailAddress',
                        },
                        {
                            attributes: {
                                required: false,
                            },
                            id: 'username',
                            label: 'Username',
                            type: 'text',
                        },
                    ],
                    createdDate: 1639656055763,
                    description: '',
                    userAccountTypeId: 'default',
                    label: 'Default',
                },
                includeFields: ['name', 'email'],
            },
            fieldsOrder: ['name', 'email', 'org--name', 'password'],
        },
    ];

    injectTypeDataIntoConfigs(): Observable<any> {
        return of(MockEditUserTypeService.MOCK_FORM_CONFIGS_RESPONSE);
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

@Component({
    selector: 'oc-edit-user-form',
    template: '',
})
export class MockEditUserFormComponent {
    @Input() formConfigs: any[];
    @Input() enableTypesDropdown = false;
    @Input() enablePasswordField = false;
    @Input() enableTermsCheckbox: any;
    @Input() defaultTypeLabelText = 'Type';
    @Input() defaultAccountData: any;
    @Input() defaultOrganizationData: any;
    @Input() defaultEmptyConfigsErrorTemplate: TemplateRef<any>;
    @Input() defaultEmptyConfigsErrorMessage: string = 'There are no forms configured';
    @Input() customTermsDescription: TemplateRef<any>;
    @Input() formId: any = 'editUser';
    @Output() readonly resultFormDataChange = new EventEmitter<any>();
    @Output() readonly createdFormGroup = new EventEmitter<any>();
}
@Component({
    selector: 'oc-social-links',
    template: '',
})
export class MockSocialLinks {
    @Input() socialLinks: SocialLink[];
}
@Component({
    selector: 'app-general-profile',
    template: '',
})
export class MockGeneralProfileComponent {}

@Component({
    selector: 'app-change-password',
    template: '',
})
export class MockChangePasswordComponent {}

@Component({
    selector: 'app-billing',
    template: '',
})
export class MockBillingComponent {}

@Component({
    selector: 'app-billing-history',
    template: '',
})
export class MockBillingHistoryComponent {}

@Component({
    selector: 'app-button-action',
    template: '',
})
export class MockButtonActionComponent {
    @Input() buttonAction: any;
    @Input() appData: any;
    @Input() viewType: string = 'button';
    @Output() readonly updateAppData: EventEmitter<void> = new EventEmitter<void>();
}

@Component({
    selector: 'oc-login',
    template: '',
})
export class MockOcLoginComponent {
    @Input() loginModel: any = {};
    @Input() loginButtonText: string = 'Log in';
    @Input() forgotPwdUrl: string;
    @Input() signupUrl: string;
    @Input() companyLogoUrl: string = './assets/angular-common-components/logo-company.png';
    @Input() process: boolean = false;
    @Input() incorrectEmailErrorCode: string = 'email_is_incorrect';
    @Input() incorrectEmailErrorCodeTemplate: TemplateRef<any>;
    @Input() notVerifiedEmailErrorCode: string = 'email_not_verified';
    @Input() notVerifiedEmailErrorTemplate: TemplateRef<any>;
    @Input() passwordResetRequiredErrorCode: string = 'password_reset_required';
    @Input() passwordResetRequiredErrorTemplate: TemplateRef<any>;
    @Input() headingTag: string = 'h1';
    @Output() readonly loginModelChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() readonly submit: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() readonly sendActivationLink: EventEmitter<string> = new EventEmitter<string>();
}

export class MockLoginRequest {
    idToken: string;
    accessToken: string;

    constructor(idToken: string, accessToken: string) {
        this.idToken = idToken;
        this.accessToken = accessToken;
    }
}

export class MockOAuthService {
    events: Subject<any> = new Subject<any>();
    state = {};

    logOut(...args: any): void {
        // do nothing
    }

    loadDiscoveryDocumentAndLogin(...args: any): Promise<any> {
        return Promise.resolve({});
    }

    configure(...args: any): void {
        // do nothing
    }

    getIdToken(): string {
        return '';
    }

    getAccessToken(): string {
        return '';
    }
}

export class MockButtonActionService {
    canBeShow(app: any, buttons: any): any {
        return buttons;
    }
}

export class MockLogOutService {
    removeSpecificParamKeyFromTheUrlForSaml2Logout(): void {
        // do nothing
    }
    logOutAndRedirect(): void {
        // do nothing
    }
}

export const createMockedBrowserStorage = () => {
    let store = {};

    return {
        getItem(key: string): any {
            return store[key] || null;
        },
        setItem(key: string, value: any): void {
            store[key] = value.toString();
        },
        removeItem(key: string): void {
            delete store[key];
        },
        clear(): void {
            store = {};
        },
    };
};

// providers
export function mockUserServiceProvider(): Provider {
    return { provide: UsersService, useClass: MockUsersService };
}

export function mockInviteUserServiceProvider(userInvites?: InviteUserModel[]): Provider {
    return { provide: InviteUserService, useFactory: () => new MockInviteUserService(userInvites) };
}

export function mockInviteUserAccountServiceProvider(currentUserAccount: UserAccount, otherUserAccounts: UserAccount[]): Provider {
    return { provide: UserAccountService, useFactory: () => new MockUserAccountService(currentUserAccount, otherUserAccounts) };
}

export function mockUserRoleServiceProvider(): Provider {
    return { provide: UserRoleService, useClass: MockUserRoleService };
}

export function mockToastrService(): Provider {
    return { provide: ToastrService, useClass: MockToastrService };
}
