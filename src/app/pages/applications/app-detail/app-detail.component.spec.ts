import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { AppDetailComponent } from './app-detail.component';
import {
    AppsService,
    AppVersionService,
    AuthHolderService,
    FrontendService,
    Page,
    ReviewsService,
    SiteContentService,
    StatisticService,
} from '@openchannel/angular-common-services';
import { RouterTestingModule } from '@angular/router/testing';
import { asyncScheduler, of, throwError } from 'rxjs';
import { observeOn } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Filter, OCReviewDetails, OverallRatingSummary } from '@openchannel/angular-common-components';
import { Location } from '@angular/common';
import { FullAppData } from '@openchannel/angular-common-components/src/lib/common-components';
import { pageConfig } from '../../../../assets/data/configData';
import {
    MockButtonActionComponent,
    MockButtonComponent,
    MockDropdownComponent,
    MockOcAppDescriptionComponent,
    MockOcImageGalleryComponent,
    MockOcOverallRatingComponent,
    MockOcRatingComponent,
    MockOcRecomendedAppsComponent,
    MockOcReviewComponent,
    MockOcReviewListComponent,
    MockOcVideoComponent,
    MockRoutingComponent,
} from '../../../../mock/components.mock';
import {
    mockAppsService,
    mockAppVersionService,
    mockAuthHolderService,
    mockButtonActionService,
    mockFrontendService,
    mockLoadingBarService,
    mockMarketMetaTagService,
    mockReviewsService,
    mockSiteContentService,
    mockStatisticService,
    mockTitleService,
} from '../../../../mock/providers.mock';
import { MockAppsService, MockFrontendService } from '../../../../mock/services.mock';

const mockReviewsDetailsPage: Page<OCReviewDetails> = {
    count: 1,
    pages: 1,
    pageNumber: 1,
    list: [
        {
            rating: 450,
            userId: 'amazon',
            reviewId: '600eef817ec0f53371d1cb1b',
            reviewOwnerName: 'Amazon',
            review: 'Review',
            status: {
                reason: 'Auto approved',
                value: 'approved',
            },
        },
    ],
};

const mockSearchFilters: Filter[] = [
    {
        id: 'collections',
        name: 'Collections',
        description: '',
        values: [
            {
                id: 'allApps',
                label: 'All Apps',
                sort: '{"randomize":1}',
                query: '{"status.value":"approved"}',
                description: '',
                checked: false,
                values: [],
            },
            {
                id: 'test-filter',
                label: 'Test filter',
                sort: '{"nameCase":1}',
                query: '{"status.value":"approved"}',
                description: '',
                checked: false,
                values: [],
            },
        ],
    },
];

const mockAppStat = { '90day': 1, '30day': 2, total: 3 };
const mockFilter = { value: 'selectedFilter', label: 'label' };
const mockSort = { value: 'selectedSort', label: 'label' };

const mockFullAppData: FullAppData = {
    appId: '123321',
    lastUpdated: 1,
    version: 1,
    name: 'name',
    safeName: [],
    developerId: 'developerId',
    model: [],
    submittedDate: 1123332,
    created: 13212,
    rating: 5,
    reviewCount: 2,
    status: {
        value: 'pending',
        lastUpdated: 123,
        modifiedBy: 'user',
        reason: 'reason',
    },
    statistics: {
        views: { ...mockAppStat },
        downloads: { ...mockAppStat },
        developerSales: { ...mockAppStat },
        totalSales: { ...mockAppStat },
        ownerships: { ...mockAppStat },
        reviews: { ...mockAppStat },
    },
    isLive: false,
};

const mockReview: any = {
    reviewId: 'reviewId',
    headline: 'headline',
    description: 'description',
    rating: 5,
};

describe('AppDetailComponent', () => {
    const mockAppId = '123';
    const mockAppVersion = '1';
    const mockSafeName = 'App-name';

    let component: AppDetailComponent;
    let fixture: ComponentFixture<AppDetailComponent>;
    let activatedRoute: ActivatedRoute;
    let location: Location;

    global.close = jest.fn();

    const createLoader = () => {
        if (!(component as any).loader) {
            (component as any).loader = (component as any).loadingBar.useRef();
        }
    };

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    AppDetailComponent,
                    MockButtonComponent,
                    MockOcRatingComponent,
                    MockButtonActionComponent,
                    MockOcVideoComponent,
                    MockOcImageGalleryComponent,
                    MockOcAppDescriptionComponent,
                    MockOcOverallRatingComponent,
                    MockOcReviewListComponent,
                    MockOcReviewComponent,
                    MockDropdownComponent,
                    MockOcRecomendedAppsComponent,
                ],
                providers: [
                    mockAppsService(),
                    mockAppVersionService(),
                    mockFrontendService(),
                    mockLoadingBarService(),
                    mockTitleService(),
                    mockStatisticService(),
                    mockMarketMetaTagService(),
                    mockSiteContentService(),
                    mockAuthHolderService(),
                    mockButtonActionService(),
                    mockReviewsService(),
                ],
                imports: [
                    RouterTestingModule.withRoutes([
                        { component: MockRoutingComponent, path: 'browse' },
                        { component: MockRoutingComponent, path: 'browse/:filterId/:valueId' },
                        { component: MockRoutingComponent, path: 'not-found' },
                    ]),
                ],
            }).compileComponents();

            activatedRoute = TestBed.inject(ActivatedRoute);
            location = TestBed.inject(Location);
        }),
    );

    beforeEach(() => {
        jest.resetAllMocks();
        fixture = TestBed.createComponent(AppDetailComponent);
        component = fixture.componentInstance;
        createLoader();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should complete destroy$ and loader in ngOnDestroy hook', () => {
        jest.spyOn((component as any).destroy$, 'complete');
        jest.spyOn((component as any).destroy$, 'next');
        jest.spyOn((component as any).loader, 'complete');

        fixture.destroy();

        expect((component as any).destroy$.complete).toHaveBeenCalled();
        expect((component as any).destroy$.next).toHaveBeenCalled();
        expect((component as any).loader.complete).toHaveBeenCalled();
    });

    it(`
        should call siteContentService.getSecuritySettings() and set allowReviewsWithoutOwnership
        if the user is logged in and security settings allows reviews without ownership (initAllowReviewsWithoutOwnershipProperty())
      `, fakeAsync(() => {
        const siteContentService = TestBed.inject(SiteContentService);
        const authHolderService = TestBed.inject(AuthHolderService);

        component.allowReviewsWithoutOwnership = false;

        jest.spyOn(siteContentService, 'getSecuritySettings').mockReturnValue(
            of({ allowReviewsWithoutOwnership: true, maxCharacters: 100 }).pipe(observeOn(asyncScheduler)),
        );
        jest.spyOn(authHolderService, 'isLoggedInUser').mockReturnValue(true);

        component.initAllowReviewsWithoutOwnershipProperty();

        tick();

        expect(siteContentService.getSecuritySettings).toHaveBeenCalled();
        expect(component.allowReviewsWithoutOwnership).toBeTruthy();

        flush();

        jest.spyOn(siteContentService, 'getSecuritySettings').mockReturnValue(
            of({ allowReviewsWithoutOwnership: false, maxCharacters: 100 }),
        );

        component.initAllowReviewsWithoutOwnershipProperty();

        tick();

        expect(component.allowReviewsWithoutOwnership).toBeFalsy();
    }));

    it('should call frontendService.getSorts() and set reviewsSorts (initReviewSortQueries())', fakeAsync(() => {
        const frontendService = TestBed.inject(FrontendService);
        component.reviewsSorts = null;

        jest.spyOn(frontendService, 'getSorts').mockReturnValue(of(MockFrontendService.MOCK_SORTS_PAGE).pipe(observeOn(asyncScheduler)));

        component.initReviewSortQueries();
        tick();

        expect(frontendService.getSorts).toHaveBeenCalled();
        expect(component.reviewsSorts).not.toBeNull();
    }));

    it('should set currentUserId (initCurrentUserId())', () => {
        const authHolderService = TestBed.inject(AuthHolderService);
        const userId = 'user-id';

        component.currentUserId = null;
        authHolderService.userDetails.organizationId = userId;

        component.initCurrentUserId();
        expect(component.currentUserId).toBe(userId);
    });

    it('should call reviewsService.getReviewsByAppId() with correct arguments (loadReviews())', () => {
        const reviewsService = TestBed.inject(ReviewsService);
        component.app = { ...mockFullAppData };
        component.selectedFilter = { ...mockFilter };
        component.selectedSort = { ...mockSort };

        jest.spyOn(reviewsService, 'getReviewsByAppId');

        component.loadReviews();

        expect(reviewsService.getReviewsByAppId).toHaveBeenCalledWith(component.app.appId, component.selectedSort.value, [
            component.selectedFilter.value,
        ]);
    });

    it('should set reviewsPage (loadReviews())', fakeAsync(() => {
        component.app = { ...mockFullAppData };
        component.reviewsPage = null;

        component.loadReviews();

        tick();

        expect(component.reviewsPage).not.toBeNull();
    }));

    it('should call makeCurrentUserReviewFirst() if no sort is applied and currentUserId is set (loadReviews())', fakeAsync(() => {
        component.app = { ...mockFullAppData };

        jest.spyOn(component as any, 'makeCurrentUserReviewFirst').mockImplementation();

        // currentUserId is set and no sort applied
        component.currentUserId = '123';
        component.selectedSort = null;
        component.selectedFilter = { ...mockFilter, value: null };
        component.loadReviews();

        tick();

        expect((component as any).makeCurrentUserReviewFirst).toHaveBeenCalled();

        (component as any).makeCurrentUserReviewFirst.mockReset();

        // currentUserId is set and sort applied
        component.selectedSort = { ...mockSort };
        component.selectedFilter = { ...mockFilter, value: '123' };
        component.loadReviews();

        tick();

        expect((component as any).makeCurrentUserReviewFirst).not.toHaveBeenCalled();

        (component as any).makeCurrentUserReviewFirst.mockReset();

        // currentUserId is not set and sort applied
        component.currentUserId = null;
        component.loadReviews();

        tick();

        expect((component as any).makeCurrentUserReviewFirst).not.toHaveBeenCalled();
    }));

    it('should call countRating() if overall rating is equal to 0 (loadReviews())', fakeAsync(() => {
        component.app = { ...mockFullAppData };

        jest.spyOn(component as any, 'countRating').mockImplementation();

        component.overallRating.rating = 0;
        component.loadReviews();

        tick();

        expect((component as any).countRating).toHaveBeenCalled();
    }));

    it('should set selectedSort and call loadReviews() (onReviewSortChange())', () => {
        component.selectedSort = null;

        jest.spyOn(component, 'loadReviews').mockImplementation();

        component.onReviewSortChange({ ...mockSort });

        expect(component.selectedSort).toEqual({ ...mockSort });
        expect(component.loadReviews).toHaveBeenCalled();
    });

    it('should set selectedFilter and call loadReviews() (onReviewFilterChange())', () => {
        component.selectedFilter = null;

        jest.spyOn(component, 'loadReviews').mockImplementation();

        component.onReviewFilterChange({ ...mockFilter });

        expect(component.selectedFilter).toEqual({ ...mockFilter });
        expect(component.loadReviews).toHaveBeenCalled();
    });

    it('should set recommendedApps and call appService.getApps() (getRecommendedApps())', fakeAsync(() => {
        const appService = TestBed.inject(AppsService);

        jest.spyOn(appService, 'getApps');

        component.recommendedApps = null;

        component.getRecommendedApps();

        tick();

        expect(appService.getApps).toHaveBeenCalled();
        expect(component.recommendedApps).not.toBeNull();
    }));

    it('should call window.close() (closeWindow())', () => {
        jest.spyOn(global, 'close');

        component.closeWindow();

        expect(window.close).toHaveBeenCalled();
    });

    it('should call getApp() with correct args (getAppData())', () => {
        jest.spyOn(component as any, 'getApp').mockReturnValue(of({}));
        activatedRoute.snapshot.params = { appId: mockAppId, appVersion: mockAppVersion, safeName: mockSafeName };

        component.getAppData();

        expect((component as any).getApp).toHaveBeenCalledWith(mockSafeName, mockAppId, mockAppVersion);
    });

    it('should call statisticService.recordVisitToApp() with appId, loadReviews() and set appListingActions (getAppData())', fakeAsync(() => {
        const statisticService = TestBed.inject(StatisticService);

        component.app = { ...mockFullAppData };
        component.appListingActions = null;

        jest.spyOn(component as any, 'getApp').mockReturnValue(of({}));
        jest.spyOn(statisticService, 'recordVisitToApp');
        jest.spyOn(component, 'loadReviews').mockImplementation();

        component.getAppData();

        tick();

        expect(component.appListingActions).not.toBeNull();
        expect(statisticService.recordVisitToApp).toHaveBeenCalledWith(component.app.appId, expect.anything());
        expect(component.loadReviews).toHaveBeenCalled();
    }));

    it('should set isWritingReview to true (onNewReview())', () => {
        component.isWritingReview = false;

        component.onNewReview();

        expect(component.isWritingReview).toBeTruthy();
    });

    it('should call reviewsService methods according to current user review existence (onReviewSubmit())', fakeAsync(() => {
        const reviewsService = TestBed.inject(ReviewsService);
        component.app = { ...mockFullAppData };

        jest.spyOn(reviewsService, 'updateReview');
        jest.spyOn(reviewsService, 'createReview');
        jest.spyOn(component as any, 'reloadReview');

        component.userReview = { ...mockReview };
        component.onReviewSubmit({ ...mockReview });

        expect(reviewsService.updateReview).toHaveBeenCalledWith({
            ...mockReview,
            reviewId: component.userReview.reviewId,
            appId: component.app.appId,
        });

        tick();

        expect((component as any).reloadReview).toHaveBeenCalled();

        (component as any).reloadReview.mockReset();

        component.userReview = null;
        component.onReviewSubmit({ ...mockReview });

        expect(reviewsService.createReview).toHaveBeenCalledWith({ ...mockReview, appId: component.app.appId });

        tick();

        expect(reviewsService.createReview).toHaveBeenCalled();
    }));

    it('should correctly set reviewSubmitInProgress (onReviewSubmit())', fakeAsync(() => {
        const reviewsService = TestBed.inject(ReviewsService);

        jest.spyOn(reviewsService, 'updateReview').mockReturnValue(throwError('Error').pipe(observeOn(asyncScheduler)));
        jest.spyOn(reviewsService, 'createReview').mockReturnValue(throwError('Error').pipe(observeOn(asyncScheduler)));

        component.app = { ...mockFullAppData };
        component.userReview = { ...mockReview };

        jest.spyOn(component as any, 'reloadReview').mockImplementation();

        component.onReviewSubmit({ ...mockReview });

        expect(component.reviewSubmitInProgress).toBeTruthy();

        tick();

        expect(component.reviewSubmitInProgress).toBeFalsy();

        component.onReviewSubmit({ ...mockReview });

        expect(component.reviewSubmitInProgress).toBeTruthy();

        tick();

        expect(component.reviewSubmitInProgress).toBeFalsy();
    }));

    it('should set isWritingReview to false (onCancelReview())', () => {
        component.isWritingReview = true;

        component.onCancelReview();

        expect(component.isWritingReview).toBeFalsy();
    });

    it('should call correct option according to passed option (onChosenReviewActon())', () => {
        jest.spyOn(component as any, 'editReview').mockImplementation();
        jest.spyOn(component as any, 'deleteReview').mockImplementation();

        component.onChosenReviewActon('EDIT');

        expect((component as any).editReview).toHaveBeenCalled();

        component.onChosenReviewActon('DELETE');

        expect((component as any).deleteReview).toHaveBeenCalled();
    });

    it('should not navigate if the filter with passed category does not exist (goToSearchPageWithSelectedCategory())', fakeAsync(() => {
        component.searchFilters = mockSearchFilters;
        const initialPath = location.path();

        component.goToSearchPageWithSelectedCategory('not-existing-category-label');

        tick();

        expect(initialPath).toBe(location.path());
    }));

    it('should navigate to the correct page by category label (goToSearchPageWithSelectedCategory())', fakeAsync(() => {
        component.searchFilters = mockSearchFilters;
        const selectedCategory = component.searchFilters[0].values[0];
        const selectedFilter = component.searchFilters[0];

        component.goToSearchPageWithSelectedCategory(selectedCategory.label);

        tick();

        expect(location.path()).toBe(`/browse/${selectedFilter.id}/${selectedCategory.id}`);
    }));

    it('should call location.back() (goBack())', () => {
        jest.spyOn((component as any).location, 'back');

        component.goBack();

        expect((component as any).location.back).toHaveBeenCalled();
    });

    it('should call frontendService.getFilters() and set searchFilters (getSearchFilters())', fakeAsync(() => {
        const frontendService = TestBed.inject(FrontendService);

        jest.spyOn(frontendService, 'getFilters');

        component.searchFilters = null;

        (component as any).getSearchFilters();

        tick();

        expect(frontendService.getFilters).toHaveBeenCalled();
        expect(component.searchFilters).toEqual(MockFrontendService.MOCK_FILTERS_PAGE.list);
    }));

    it('should not affect reviewsPage if the current user does not have review (makeCurrentUserReviewFirst())', () => {
        component.reviewsPage = mockReviewsDetailsPage;
        component.currentUserId = 'some-id';
        const initialReviewsPage = component.reviewsPage;

        (component as any).makeCurrentUserReviewFirst();

        expect(initialReviewsPage).toEqual(component.reviewsPage);
    });

    it('should call reviewsService.getOneReview(), set userReview and isWritingReview (editReview())', fakeAsync(() => {
        const reviewsService = TestBed.inject(ReviewsService);

        jest.spyOn(reviewsService, 'getOneReview').mockReturnValue(of(mockReview).pipe(observeOn(asyncScheduler)));

        component.isWritingReview = false;
        component.userReview = mockReview;

        (component as any).editReview();
        component.userReview = null;

        tick();

        expect(reviewsService.getOneReview).toHaveBeenCalled();
        expect(component.isWritingReview).toBeTruthy();
        expect(component.userReview).toEqual(mockReview);
    }));

    it('should call method to get app according to safeName existence (getApp())', () => {
        const appService = TestBed.inject(AppsService);
        const appVersionService = TestBed.inject(AppVersionService);

        jest.spyOn(appService, 'getAppBySafeName');
        jest.spyOn(appVersionService, 'getAppByVersion');

        (component as any).getApp('safeName', 'id', 'version');

        expect(appService.getAppBySafeName).toHaveBeenCalled();

        (component as any).getApp(null, 'id', 'version');

        expect(appVersionService.getAppByVersion).toHaveBeenCalled();
    });

    it('should navigate to the 404 page if getAppBySafeName returns 404 (getApp())', fakeAsync(() => {
        const appService = TestBed.inject(AppsService);

        jest.spyOn(appService, 'getAppBySafeName').mockReturnValue(throwError({ status: 404 }).pipe(observeOn(asyncScheduler)));

        try {
            (component as any).getApp('safeName', 'id', 'version').subscribe();
            tick();
        } catch {}
        expect(location.path()).toBe('/not-found');
    }));

    it('should call metaTagService.pushSelectedFieldsToTempPageData() and titleService.setSpecialTitle() (getApp())', fakeAsync(() => {
        const appService = TestBed.inject(AppsService);

        jest.spyOn(appService, 'getAppBySafeName');

        const mockPushFields = jest.spyOn((component as any).metaTagService, 'pushSelectedFieldsToTempPageData');
        const mockSetTitle = jest.spyOn((component as any).titleService, 'setSpecialTitle');

        (component as any).getApp('safeName', 'id', 'version').subscribe();

        tick();

        expect(mockPushFields).toHaveBeenCalledWith({ app: MockAppsService.MOCK_APP });
        expect(mockSetTitle).toHaveBeenCalledWith(MockAppsService.MOCK_APP.name);
    }));

    it('should set app and correctly map it (getApp())', fakeAsync(() => {
        const appService = TestBed.inject(AppsService);

        const app = { ...MockAppsService.MOCK_APP };
        const mappedApp = new FullAppData(app, pageConfig.fieldMappings);

        jest.spyOn(appService, 'getAppBySafeName');

        (component as any).getApp('safeName', 'id', 'version').subscribe();

        tick();

        expect(component.app).toEqual(mappedApp);
    }));

    it('should call loadReviews() and set reviewSubmitInProgress, isWritingReview to false (reloadReview())', () => {
        jest.spyOn(component, 'loadReviews').mockImplementation();

        component.reviewSubmitInProgress = true;
        component.isWritingReview = true;

        (component as any).reloadReview();

        expect(component.loadReviews).toHaveBeenCalled();
        expect(component.reviewSubmitInProgress).toBeFalsy();
        expect(component.isWritingReview).toBeFalsy();
    });

    it('should call reviewsService.deleteReview() and loadReviews() after deleting (deleteReview())', fakeAsync(() => {
        const reviewsService = TestBed.inject(ReviewsService);

        jest.spyOn(reviewsService, 'deleteReview');
        jest.spyOn(component, 'loadReviews').mockImplementation();

        component.userReview = { ...mockReview };

        (component as any).deleteReview();

        tick();

        expect(reviewsService.deleteReview).toHaveBeenCalledWith(component.userReview.reviewId);
        expect(component.loadReviews).toHaveBeenCalled();
    }));

    it('should correctly set overallRating (countRating())', () => {
        component.app = { ...mockFullAppData };
        component.reviewsPage = { ...mockReviewsDetailsPage };

        const approvedReviews = component.reviewsPage.list.filter(review => review.status.value === 'approved');
        const expectedRating = new OverallRatingSummary(component.app.rating / 100, component.app.reviewCount);
        approvedReviews.forEach(review => expectedRating[Math.floor(review.rating / 100)]++);

        (component as any).countRating();

        expect(component.overallRating).toEqual(expectedRating);
    });

    it('should call correct methods to setup component (ngOnInit())', () => {
        const expectedMethodsToCall = [
            'initCurrentUserId',
            'initAllowReviewsWithoutOwnershipProperty',
            'initReviewSortQueries',
            'getAppData',
            'initReviewSortQueries',
            'getRecommendedApps',
            'getSearchFilters',
        ];

        expectedMethodsToCall.forEach(method => {
            jest.spyOn(component, method as any).mockImplementation();
        });

        fixture.detectChanges();

        expectedMethodsToCall.forEach(method => {
            expect(component[method]).toHaveBeenCalled();
        });
    });
});
