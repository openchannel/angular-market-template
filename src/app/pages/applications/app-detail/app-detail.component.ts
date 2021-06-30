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
    UserAccountService,
} from '@openchannel/angular-common-services';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { map, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { pageConfig } from '../../../../assets/data/configData';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { ButtonAction, DownloadButtonAction } from './button-action/models/button-action.model';
import { DropdownModel, FullAppData, OCReviewDetails, OverallRatingSummary, Review } from '@openchannel/angular-common-components';
import { get, find } from 'lodash';

@Component({
    selector: 'app-app-detail',
    templateUrl: './app-detail.component.html',
    styleUrls: ['./app-detail.component.scss'],
})
export class AppDetailComponent implements OnInit, OnDestroy {
    get isDownloadRendered(): boolean {
        return true;
    }
    app: FullAppData;
    recommendedApps: FullAppData[] = [];
    appData$: Observable<FullAppData>;
    overallRating: OverallRatingSummary = new OverallRatingSummary();

    reviewsPage: Page<OCReviewDetails>;
    userReview: Review;

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
    // id of the current user. Necessary for a new review
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
        private accountService: UserAccountService,
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
    }

    loadReviews(): void {
        this.loader.start();
        this.reviewsService
            .getReviewsByAppId(
                this.app.appId,
                this.selectedSort ? this.selectedSort.value : null,
                this.selectedFilter ? this.selectedFilter.value : null,
            )
            .pipe(
                takeUntil(this.destroy$),
                tap((page: Page<OCReviewDetails>) => (this.reviewsPage = page)),
            )
            .subscribe(
                () => {
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

    navigateTo(parts: any[]): void {
        this.router.navigate(parts).then();
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
                mergeMap(value => this.statisticService.recordVisitToApp(this.app.appId)),
            )
            .subscribe(
                () => {},
                () => this.loader.complete(),
            );
    }

    onNewReview(): void {
        this.isWritingReview = true;
    }

    catchReviewData(review: Review): void {
        this.reviewSubmitInProgress = true;
        const reviewData = {
            ...review,
            userId: this.currentUserId,
            appId: this.app.appId,
        };

        this.reviewsService
            .createReview(reviewData)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                () => {
                    this.loadReviews();
                    this.reviewSubmitInProgress = false;
                    this.isWritingReview = false;
                },
                () => (this.reviewSubmitInProgress = false),
            );
    }

    onCancelReview(): void {
        this.isWritingReview = false;
    }

    private getApp(safeName: string, appId: string, appVersion: string): Observable<FullAppData> {
        const appData = safeName
            ? this.appService.getAppBySafeName(safeName)
            : this.appVersionService.getAppByVersion(appId, Number(appVersion));

        return appData.pipe(
            takeUntil(this.destroy$),
            map(app => new FullAppData(app, pageConfig.fieldMappings)),
            tap(app => {
                this.titleService.setSpecialTitle(app.name);

                if (app.ownership) {
                    this.accountService
                        .getUserAccount()
                        .pipe(takeUntil(this.destroy$))
                        .subscribe(userData => {
                            this.currentUserId = userData.userId;
                        });
                }
                return (this.app = app);
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
}
