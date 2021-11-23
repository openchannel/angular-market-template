import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    AppsService,
    ReviewsService,
    Page,
    AppVersionService,
    AppFormService,
    TitleService,
    FrontendService,
    StatisticService,
} from '@openchannel/angular-common-services';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { pageConfig } from 'assets/data/configData';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { ButtonAction, DownloadButtonAction } from './button-action/models/button-action.model';
import {
    DropdownModel,
    FullAppData,
    OCReviewDetails,
    OverallRatingSummary,
    Review,
    ReviewListOptionType,
} from '@openchannel/angular-common-components';
import { get, find } from 'lodash';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { HttpHeaders } from '@angular/common/http';
import { Location } from '@angular/common';
import { MarketMetaTagService } from '@core/services/meta-tag-service/meta-tag-service.service';

@Component({
    selector: 'app-app-detail',
    templateUrl: './app-detail.component.html',
    styleUrls: ['./app-detail.component.scss'],
})
export class AppDetailComponent implements OnInit, OnDestroy {
    app: FullAppData;
    recommendedApps: FullAppData[] = [];
    appData$: Observable<FullAppData>;
    overallRating: OverallRatingSummary = new OverallRatingSummary();

    reviewsPage: Page<OCReviewDetails>;
    // review of the current user from the review list
    userReview: OCReviewDetails | Review;

    reviewsSorts: DropdownModel<string>[];
    selectedSort: DropdownModel<string>;
    reviewsFilter: DropdownModel<string>[] = [
        new DropdownModel('All Stars', null),
        new DropdownModel('5 Stars', `{'rating': 500}`),
        new DropdownModel('4 Stars', `{'rating': 400}`),
        new DropdownModel('3 Stars', `{'rating': 300}`),
        new DropdownModel('2 Stars', `{'rating': 200}`),
        new DropdownModel('1 Stars', `{'rating': 100}`),
    ];
    selectedFilter: DropdownModel<string> = this.reviewsFilter[0];
    isDeveloperPreviewPage: boolean = false;
    // switch between the review form and the review list
    isWritingReview: boolean = false;
    // flag for disabling a submit button and set a spinner while the request in process
    reviewSubmitInProgress: boolean = false;
    appListingActions: ButtonAction[];
    // id of the current user. Necessary for a review
    currentUserId: string;

    private destroy$: Subject<void> = new Subject();
    private appConfigPipe = pageConfig.fieldMappings;
    private loader: LoadingBarState;

    constructor(
        private appService: AppsService,
        private appVersionService: AppVersionService,
        private reviewsService: ReviewsService,
        private frontendService: FrontendService,
        private loadingBar: LoadingBarService,
        private route: ActivatedRoute,
        private router: Router,
        private modalService: NgbModal,
        private formService: AppFormService,
        private toaster: ToastrService,
        private titleService: TitleService,
        private statisticService: StatisticService,
        private metaTagService: MarketMetaTagService,
        private location: Location,
    ) {}

    ngOnInit(): void {
        this.loader = this.loadingBar.useRef();

        this.getAppData();

        this.frontendService
            .getSorts()
            .pipe(takeUntil(this.destroy$))
            .subscribe(page => {
                this.reviewsSorts = page.list[0]
                    ? page.list[0].values.map(value => new DropdownModel<string>(value.label, value.sort))
                    : null;
            });

        this.getRecommendedApps();

        this.router.routeReuseStrategy.shouldReuseRoute = () => {
            return false;
        };
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.loader.complete();
    }

    loadReviews(): void {
        this.loader.start();

        const filterArray: string[] = [];
        const obsArr: Observable<Page<OCReviewDetails>>[] = [];

        if (this.selectedFilter && this.selectedFilter.value) {
            filterArray.push(this.selectedFilter.value);
        }

        if (this.currentUserId) {
            filterArray.push(`{'userId': {'$ne': ['${this.currentUserId}']}}`);
            obsArr.push(
                this.reviewsService.getReviewsByAppId(this.app.appId, this.selectedSort ? this.selectedSort.value : null, [
                    `{'userId': '${this.currentUserId}'}`,
                ]),
            );
        }
        obsArr.push(this.reviewsService.getReviewsByAppId(this.app.appId, this.selectedSort ? this.selectedSort.value : null, filterArray));

        forkJoin(obsArr)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                resPage => {
                    this.reviewsPage = { ...resPage[0], ...resPage[1] };
                    this.userReview = find(this.reviewsPage.list, ['userId', this.currentUserId]);
                    this.loader.complete();
                    if (this.overallRating.rating === 0) {
                        this.countRating();
                    }
                },
                () => this.loader.complete(),
            );
    }

    onReviewSortChange(selected: DropdownModel<string>): void {
        this.selectedSort = selected;
        this.loadReviews();
    }

    onReviewFilterChange(selected: DropdownModel<string>): void {
        this.selectedFilter = selected;
        this.loadReviews();
    }

    getRecommendedApps(): void {
        this.loader.start();

        this.appService
            .getApps(1, 3, '{randomize: 1}', "{'status.value':'approved'}")
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                apps => {
                    this.recommendedApps = apps.list.map(app => new FullAppData(app, this.appConfigPipe));
                    this.loader.complete();
                },
                () => {
                    this.loader.complete();
                },
            );
    }

    closeWindow(): void {
        window.close();
    }

    getAppData(): void {
        this.loader.start();

        const appId = this.route.snapshot.paramMap.get('appId');
        const appVersion = this.route.snapshot.paramMap.get('appVersion');
        const safeName = this.route.snapshot.paramMap.get('safeName');

        this.appData$ = this.getApp(safeName, appId, appVersion);
        this.appData$
            .pipe(
                tap(x => {
                    this.loader.complete();
                    this.appListingActions = this.getButtonActions(pageConfig);
                    this.loadReviews();
                }),
                mergeMap(() => this.statisticService.recordVisitToApp(this.app.appId, new HttpHeaders({ 'x-handle-error': '400' }))),
            )
            .subscribe(
                () => {},
                () => this.loader.complete(),
            );
    }

    onNewReview(): void {
        this.isWritingReview = true;
    }

    onReviewSubmit(review: Review): void {
        this.reviewSubmitInProgress = true;
        const reviewData = {
            ...review,
            appId: this.app.appId,
        };
        if (this.userReview) {
            this.reviewsService
                .updateReview({
                    ...reviewData,
                    reviewId: this.userReview.reviewId,
                })
                .pipe(takeUntil(this.destroy$))
                .subscribe(
                    () => this.reloadReview(),
                    () => (this.reviewSubmitInProgress = false),
                );
        } else {
            this.reviewsService
                .createReview(reviewData)
                .pipe(takeUntil(this.destroy$))
                .subscribe(
                    () => this.reloadReview(),
                    () => (this.reviewSubmitInProgress = false),
                );
        }
    }

    onCancelReview(): void {
        this.isWritingReview = false;
    }

    onChosenReviewActon(option: ReviewListOptionType): void {
        switch (option) {
            case 'EDIT':
                this.editReview();
                return;
            case 'DELETE':
                this.deleteReview();
                return;
            default:
                return;
        }
    }

    goBack(): void {
        this.location.back();
    }

    private editReview(): void {
        this.reviewsService
            .getOneReview(this.userReview.reviewId)
            .pipe(takeUntil(this.destroy$))
            .subscribe(review => {
                this.userReview = review as Review;
                this.isWritingReview = true;
            });
    }

    private getApp(safeName: string, appId: string, appVersion: string): Observable<FullAppData> {
        const appData = safeName
            ? this.appService.getAppBySafeName(safeName)
            : this.appVersionService.getAppByVersion(appId, Number(appVersion));

        return appData.pipe(
            takeUntil(this.destroy$),
            catchError(error => {
                if (error.status === 404) {
                    this.router.navigate(['/not-found']).then(() => this.loader.complete());
                }
                return of(error);
            }),
            tap(appResponse =>
                this.metaTagService.pushSelectedFieldsToTempPageData({
                    app: appResponse,
                }),
            ),
            map(app => {
                const mappedApp = new FullAppData(app, pageConfig.fieldMappings);
                if (typeof mappedApp.images[0] === 'string') {
                    mappedApp.images = (mappedApp.images as string[]).map(imageItem => {
                        return {
                            image: imageItem,
                        };
                    });
                }
                return mappedApp;
            }),
            tap(app => {
                this.titleService.setSpecialTitle(app.name);

                if (app.ownership) {
                    this.currentUserId = app.ownership.userId;
                }
                this.app = app;
                return this.app;
            }),
        );
    }

    private countRating(): void {
        this.overallRating = new OverallRatingSummary(this.app.rating / 100, this.reviewsPage.count);
        this.reviewsPage.list.forEach(review => this.overallRating[review.rating / 100]++);
    }

    private getButtonActions(config: any): ButtonAction[] {
        const buttonActions = config?.appDetailsPage['listing-actions'];
        if (buttonActions && this.app?.type) {
            return buttonActions.filter(action => {
                const isTypeSupported = action?.appTypes?.includes(this.app.type);
                const isNoDownloadType = action?.type !== 'download';
                const isFileFieldPresent = !!get(this.app, (action as DownloadButtonAction).fileField);

                return isTypeSupported && (isNoDownloadType || isFileFieldPresent);
            });
        }
        return [];
    }

    private reloadReview(): void {
        this.loadReviews();
        this.reviewSubmitInProgress = false;
        this.isWritingReview = false;
    }

    private deleteReview(): void {
        this.reviewsService
            .deleteReview(this.userReview.reviewId)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.loadReviews());
    }
}
