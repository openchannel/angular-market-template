import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AppsService,
  ReviewsService,
  FullAppData,
  Page,
  OCReviewDetails,
  OverallRatingSummary,
  FrontendService,
  DropdownModel, AppVersionService, AppFormService, AppFormModel, TitleService,
} from 'oc-ng-common-service';
import { ActivatedRoute, Router } from '@angular/router';
import {Subject, Observable} from 'rxjs';
import {map, takeUntil, tap} from 'rxjs/operators';
import {pageConfig} from '../../../../assets/data/configData';
import {LoaderService} from '@core/services/loader.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormModalComponent} from '@shared/modals/form-modal/form-modal.component';
import {ToastrService} from 'ngx-toastr';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { LoadingBarService } from '@ngx-loading-bar/core';

@Component({
  selector: 'app-app-detail',
  templateUrl: './app-detail.component.html',
  styleUrls: ['./app-detail.component.scss']
})
export class AppDetailComponent implements OnInit, OnDestroy {

  app: FullAppData;
  recommendedApps: FullAppData [] = [];
  appData$: Observable<FullAppData>;
  overallRating: OverallRatingSummary = new OverallRatingSummary();

  reviewsPage: Page<OCReviewDetails>;

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
  isDeveloperPreviewPage = false;

  private destroy$: Subject<void> = new Subject();
  private appConfigPipe = pageConfig.fieldMappings;
  private contactForm: AppFormModel;

  private loader: LoadingBarState;

  constructor(private appService: AppsService,
              private appVersionService: AppVersionService,
              private reviewsService: ReviewsService,
              private frontendService: FrontendService,
              private loadingBar: LoadingBarService,
              private route: ActivatedRoute,
              private router: Router,
              private modalService: NgbModal,
              private formService: AppFormService,
              private toaster: ToastrService,
              private titleService: TitleService) { }

  ngOnInit(): void {
    this.loader = this.loadingBar.useRef();
    const appId = this.route.snapshot.paramMap.get('appId');
    const appVersion = this.route.snapshot.paramMap.get('appVersion');

    this.loader.start();

    this.appData$ = this.getApp(appId, appVersion)

    this.appData$.subscribe(app => {
          this.loader.complete();
          this.loadReviews();
        },err => this.loader.complete());

    this.frontendService.getSorts()
        .pipe(takeUntil(this.destroy$))
        .subscribe(page => {
          this.reviewsSorts = page.list[0] ?
              page.list[0].values.map(value => new DropdownModel<string>(value.label, value.sort)) : null;
    });

    this.getRecommendedApps();
    this.getContactForm();

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
    this.reviewsService.getReviewsByAppId(this.app.appId, this.selectedSort ? this.selectedSort.value : null,
        this.selectedFilter ? this.selectedFilter.value : null)
        .pipe(takeUntil(this.destroy$),
            tap((page: Page<OCReviewDetails>) => this.reviewsPage = page))
        .subscribe(page => {
              this.loader.complete();
              if (this.overallRating.rating === 0) {
                this.countRating();
              }
            },
            err => this.loader.complete());
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

    this.appService.getApps(1, 3, '{randomize: 1}', '{\'status.value\':\'approved\'}').pipe(
      takeUntil(this.destroy$))
      .subscribe(apps => {
        this.recommendedApps = apps.list.map(app => new FullAppData(app, this.appConfigPipe));
        this.loader.complete();
      }, () => {
        this.loader.complete();
      });
  }

  private getApp(appId: string, appVersion: string): Observable<FullAppData> {
    this.isDeveloperPreviewPage = appVersion && Number(appVersion) > 0;
    const appData = (this.isDeveloperPreviewPage) ?
        this.appVersionService.getAppByVersion(appId, Number(appVersion)):
        this.appService.getAppById(appId);

    return appData.pipe(takeUntil(this.destroy$),
          map(app => new FullAppData(app, pageConfig.fieldMappings)),
          tap(app => {
            this.titleService.setSubtitle(app.name);
             return this.app = app;
          }));
  }

  private countRating(): void {
    this.overallRating = new OverallRatingSummary(this.app.rating / 100, this.reviewsPage.count);
    this.reviewsPage.list.forEach(review => this.overallRating[review.rating / 100]++);
  }

  openContactForm() {
    const modalRef = this.modalService.open(FormModalComponent, { size: 'sm' });
    modalRef.componentInstance.formData = this.contactForm;
    modalRef.componentInstance.modalTitle = 'Contact form';

    modalRef.result.then(value => {
      if (value) {
        this.loader.start();
        this.formService.createFormSubmission(this.contactForm.formId, {
          appId: this.app.appId,
          name: value.name,
          userId: '',
          email: value.email,
          formData: {
            ...value,
          },
        }).pipe(takeUntil(this.destroy$))
        .subscribe(() => {
              this.loader.complete();
              this.toaster.success('Your message was sent to the Developer');
            },
            () => {
              this.loader.complete();
              this.toaster.error('Your message wasn\'t sent to the Developer');
            });
      }
    });
  }

  private getContactForm() {
    this.formService.getForm('lead')
    .pipe(takeUntil(this.destroy$))
    .subscribe(form => {
      this.contactForm = form;
    });
  }

  get isDownloadRendered(): boolean {
    return true;
  }

  closeWindow() {
    window.close();
  }
}
