import {AfterViewInit, Component, OnDestroy, ViewChild} from '@angular/core';
import {AppsService, ReviewsService, FullAppData, Page, OCReviewDetails, OverallRatingSummary, FrontendService, SortValue, Sort} from 'oc-ng-common-service';
import {ActivatedRoute} from '@angular/router';
import {Subject, Observable} from 'rxjs';
import {map, takeUntil, tap} from 'rxjs/operators';
import {pageConfig} from '../../../../assets/data/configData';
import {LoaderComponent} from '../../../shared/custom-components/loader/loader.component';

@Component({
  selector: 'app-app-detail',
  templateUrl: './app-detail.component.html',
  styleUrls: ['./app-detail.component.scss']
})
export class AppDetailComponent implements AfterViewInit, OnDestroy {

  @ViewChild('loader') loader: LoaderComponent;

  app: FullAppData;
  appData$: Observable<FullAppData>;
  overallRating: OverallRatingSummary = {
    rating: 0,
    reviewCount: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  reviewsPage: Page<OCReviewDetails>;

  selectedSort: SortValue;
  reviewsSorts: SortValue[];

  private destroy$: Subject<void> = new Subject();

  constructor(private appService: AppsService,
              private reviewsService: ReviewsService,
              private frontendService: FrontendService,
              private route: ActivatedRoute) { }

  ngAfterViewInit(): void {
    const appId = this.route.snapshot.paramMap.get('appId');

    this.loader.toggle();

    this.appData$ = this.appService.getAppById(appId)
        .pipe(takeUntil(this.destroy$),
              map(app => new FullAppData(app, pageConfig.fieldMappings)),
              tap(app => this.app = app));

    this.appData$.subscribe(app => {
          this.reviewsService.getReviewsByAppId(app.appId)
              .pipe(takeUntil(this.destroy$),
                    tap((page: Page<OCReviewDetails>) => this.reviewsPage = page))
              .subscribe(page => {
                this.loader.toggle();
                this.countRating();
                  },
                          err => this.loader.toggle());
        },
        err => this.loader.toggle());

    this.frontendService.getSorts().subscribe(page => {
      this.reviewsSorts = page.list[0] ? page.list[0].values : null;
      this.selectedSort = this.reviewsSorts ? this.reviewsSorts[0] : null;
      console.log(this.selectedSort);
    });
  }

  countRating(): void {
    this.overallRating = {
      rating: this.app.rating / 100,
      reviewCount: this.reviewsPage.count,
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };
    this.reviewsPage.list.forEach(review => this.overallRating[review.rating / 100]++);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
