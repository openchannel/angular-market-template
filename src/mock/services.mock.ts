import { asyncScheduler, Observable, of, Subject } from 'rxjs';
import { Page, SortResponse, Transaction, UserAccount } from '@openchannel/angular-common-services';
import { Filter } from '@openchannel/angular-common-components';
import { observeOn } from 'rxjs/operators';
import { InviteUserModel } from '@openchannel/angular-common-services/lib/model/api/invite-user.model';

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
export class MockManagementModalService {
    openDeleteInviteModal(): Observable<boolean> {
        return null;
    }

    openDeleteCurrentUserAccountModal(): Observable<boolean> {
        return null;
    }

    openDeleteAnotherUserAccountModal(): Observable<boolean> {
        return null;
    }

    openEditUserAccountModal(userAccount: UserAccount): Observable<boolean> {
        return null;
    }

    openEditUserInviteModal(userInvite: UserAccount): Observable<boolean> {
        return null;
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

    searchApp(): Observable<any> {
        return of('1');
    }
}

export class MockCmsContentService {
    getContentDefault(): any {
        return of('1');
    }

    getContentFromAPI(): Observable<any> {
        return of('1');
    }

    getContentByPaths(...args: any): Observable<any> {
        return of(args);
    }
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
