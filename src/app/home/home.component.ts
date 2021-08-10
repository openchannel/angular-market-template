import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppsService, FrontendService, SiteConfigService, TitleService } from '@openchannel/angular-common-services';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { pageConfig } from '../../assets/data/configData';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { forIn } from 'lodash';
import { AppCategoryDetail, Filter, FullAppData } from '@openchannel/angular-common-components';
import {CmsContentService} from '@core/services/cms-content-service/cms-content-service.service';

export interface GalleryItem {
    filterId: string;
    valueId: string;
    label: string;
    description: string;
    data: FullAppData[];
}

interface CMSData {
    pageInfoTitle: string;
    pageInfoSubtext: string;
    bottomCalloutHeader: string;
    bottomCalloutImageURL: string;
    bottomCalloutDescription: string;
    bottomCalloutButtonText: string;
    bottomCalloutButtonLocation: string;
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
    featuredApp: FullAppData[] = [];
    categories: AppCategoryDetail[] = [];
    sidebarFilters: Filter[];

    homePageConfig;
    categoriesData: any[] = [];
    filterCollapsed = true;

    gallery: GalleryItem[];
    loader: LoadingBarState;

    cmsData: CMSData = {
        pageInfoTitle: '',
        pageInfoSubtext: '',
        bottomCalloutHeader: '',
        bottomCalloutImageURL: '',
        bottomCalloutDescription: '',
        bottomCalloutButtonText: '',
        bottomCalloutButtonLocation: '',
    };

    private destroy$: Subject<void> = new Subject();

    private readonly DEFAULT_FILTER_ID = 'collections';
    private readonly DEFAULT_FILTER_VALUE_ID = 'allApps';
    private readonly featuredFilter = JSON.stringify({ "attributes.featured": "yes" });
    private readonly featuredSort = JSON.stringify({ randomize: 1 });

    constructor(
        private appService: AppsService,
        private frontendService: FrontendService,
        private loadingBar: LoadingBarService,
        private siteService: SiteConfigService,
        private titleService: TitleService,
        private cmsService: CmsContentService,
        public router: Router,
    ) {}

    ngOnInit(): void {
        this.loader = this.loadingBar.useRef();
        this.setTagLineToPageTitleService();
        this.getPageConfig();
        this.initCMSData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.loader?.complete();
    }

    setTagLineToPageTitleService(): void {
        this.siteService
            .getSiteConfigAsObservable()
            .pipe(takeUntil(this.destroy$))
            .subscribe(config => this.titleService.setSpecialTitle(config.tagline, true));
    }

    getPageConfig(): void {
        this.homePageConfig = pageConfig;
        this.getFeaturedApps();
        this.getFilters();
    }

    // Getting featured apps separately
    getFeaturedApps(): void {
        this.getApps(this.featuredSort, this.featuredFilter).subscribe(apps => {
            this.featuredApp = apps;
        });
    }

    getAppsForFilters(filters: Filter[]): void {
        this.gallery = [];

        if (filters) {
            const tempGallery = [].concat(
                ...filters
                    .filter(f => f?.values)
                    .map(filter =>
                        [].concat(
                            ...filter.values.map(value => {
                                return {
                                    valueId: value.id,
                                    filterId: filter.id,
                                    ...value,
                                };
                            }),
                        ),
                    ),
            );

            forkJoin(tempGallery.map(gallery => this.getApps(gallery.sort, gallery.query)))
                .pipe(
                    tap(allApps => forIn(allApps, (apps, i) => (tempGallery[i].data = apps))),
                    takeUntil(this.destroy$),
                )
                .subscribe(() => {
                    this.gallery = tempGallery.filter(g => g.data.length > 0);
                });
        }
    }

    getApps(sort: string, filter: string): Observable<FullAppData[]> {
        return this.appService.getApps(1, 4, sort, filter).pipe(
            tap(() => this.loader.start()),
            map(res => res.list.map(app => new FullAppData(app, this.homePageConfig.fieldMappings))),
            tap(() => this.loader.complete()),
            catchError(err => {
                this.loader.complete();
                throw err;
            }),
            takeUntil(this.destroy$),
        );
    }

    getCategoriesToExplore(filters: Filter[]): void {
        const categoriesConfig = [
            {
                background: '',
                logo: '../../../../assets/img/all-apps-category-icon.svg',
                color: '',
            },
            {
                background: '../../../../assets/img/analytics-category-background.png',
                logo: '../../../../assets/img/analytics-category-icon.svg',
                color: '#907cfe',
            },
            {
                background: '../../../../assets/img/communication-category-background.png',
                logo: '../../../../assets/img/communication-category-icon.svg',
                color: '#ff6262',
            },
            {
                background: '../../../../assets/img/management-category-background.png',
                logo: '../../../../assets/img/management-category-icon.svg',
                color: '#81cf7c',
            },
            {
                background: '../../../../assets/img/analytics-category-background.png',
                logo: '../../../../assets/img/productivity-category-icon.svg',
                color: '#907cfe',
            },
            {
                background: '../../../../assets/img/tool-category-background.png',
                logo: '../../../../assets/img/tool-category-icon.svg',
                color: '#4691de',
            },
        ];
        const categoryProps = pageConfig.appListPage.find(list => list.type === 'filter-values-card-list');
        let categoryIndex = 0;
        if (categoryProps) {
            this.categoriesData = [...filters.find(filter => filter.id === categoryProps.filterId).values];
            this.categoriesData.forEach(data => {
                if (categoryIndex === categoriesConfig.length) {
                    categoryIndex = 0;
                }
                const category: AppCategoryDetail = {
                    categoryLogo: categoriesConfig[categoryIndex].logo,
                    categoryBackgroundImage: categoriesConfig[categoryIndex].background,
                    categoryName: data.label,
                    categoryTitleColor: categoriesConfig[categoryIndex].color,
                    categoryQuery: {
                        filterId: categoryProps.filterId,
                        valueId: data.id,
                    },
                };
                this.categories.push(category);
                categoryIndex++;
            });
        }
    }

    getSidebarFilters(filters: Filter[]): void {
        this.sidebarFilters = [...filters];
        for (const filterModel of this.sidebarFilters) {
            filterModel.values = filterModel.values.map(filterValue => {
                return {
                    ...filterValue,
                    checked: false,
                };
            });
        }
    }

    getFilters(): void {
        this.loader.start();
        this.frontendService
            .getFilters()
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                result => {
                    this.getCategoriesToExplore(result.list);
                    this.getSidebarFilters(result.list);
                    this.getAppsForFilters(result.list);
                    this.loader.complete();
                },
                () => this.loader.complete(),
            );
    }

    catchSearchText(searchText: string): void {
        this.goToBrowsePage(this.DEFAULT_FILTER_ID, this.DEFAULT_FILTER_VALUE_ID, searchText);
    }

    goToBrowsePage(filterId: string, filterValueId: string, searchText?: string): void {
        this.router
            .navigate(['browse', filterId, filterValueId], { queryParams: searchText ? { search: searchText } : {} })
            .then(() => window.scrollTo(0, 0));
    }

    onCollapseChanged(status: boolean): void {
        this.filterCollapsed = status;
    }

    initCMSData(): void {
        this.cmsService
            .getContentByPaths({
                pageInfoTitle: 'big-hero.title',
                pageInfoSubtext: 'big-hero.subtext',
                bottomCalloutHeader: 'content-callout.title',
                bottomCalloutImageURL: 'content-callout.image',
                bottomCalloutDescription: 'content-callout.body',
                bottomCalloutButtonText: 'content-callout.button.text',
                bottomCalloutButtonLocation: 'content-callout.button.location',
            })
            .subscribe(content => (this.cmsData = content as CMSData));
    }
}
