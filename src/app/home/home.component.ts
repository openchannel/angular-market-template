import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AppCategoryDetail,
  FullAppData,
  AppsService,
  FrontendService,
  Filter, SiteConfigService, TitleService, OcSidebarSelectModel,
} from 'oc-ng-common-service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { pageConfig } from '../../assets/data/configData';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  public featuredApp: FullAppData[] = [];
  public categories: AppCategoryDetail[] = [];
  public sidebarFilters: Filter[];

  public isFeatured = false;
  public homePageConfig;
  public categoriesData: any [] = [];

  public loader: LoadingBarState;

  private subscriber: Subscription = new Subscription();

  private readonly DEFAULT_FILTER_ID = 'collections'
  private readonly DEFAULT_FILTER_VALUE_ID = 'allApps'

  constructor(private appService: AppsService,
              private router: Router,
              private frontendService: FrontendService,
              private loadingBar: LoadingBarService,
              private siteService: SiteConfigService,
              private titleService: TitleService) { }

  ngOnInit(): void {
    this.titleService.setSpecialTitle(this.siteService.siteConfig.tagline, true);
    this.loader = this.loadingBar.useRef();
    this.getPageConfig();
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }

  getPageConfig(): void {
    this.homePageConfig = pageConfig;
    this.getFeaturedApps();
    this.appsForCategory();
    this.getFilters();
  }

  // Getting featured apps separately
  getFeaturedApps(): void {
    if (this.homePageConfig && this.homePageConfig.appListPage && this.homePageConfig.appListPage.length > 0) {
      const featureConfig = this.homePageConfig.appListPage.find(filer => filer.type.includes('featured-apps'));
      if (featureConfig) {
        this.loader.start();
        this.subscriber.add(
          this.appService.getApps(1, 6, featureConfig.sort, featureConfig.filter)
            .subscribe(res => {
              this.featuredApp = res.list.map(app => new FullAppData(app, this.homePageConfig.fieldMappings));
              if (this.featuredApp && this.featuredApp.length > 0) {
                this.isFeatured = true;
              }
              this.loader.complete();
            }, () => this.loader.complete())
        );
      }
    }
  }

// Getting apps for each filter from page config
  appsForCategory(): void {
    this.homePageConfig.appListPage.forEach(element => {
      if (element.type !== 'featured-apps' && element.type !== 'search' &&
        element.type !== 'filter-values-card-list') {
        this.loader.start();
        this.subscriber.add(
          this.appService.getApps(1, 4, element.sort, element.filter)
            .subscribe(res => {
              element.data = res.list.map(app => new FullAppData(app, this.homePageConfig.fieldMappings));
              this.loader.complete();
            }, () => this.loader.complete())
        );
      }
    });
  }

  getCategoriesToExplore(filters: Filter []) {
    const categoriesConfig = [
      { background: '',
        logo: '../../../../assets/img/all-apps-category-icon.svg',
        color: ''
      },
      {
        background: '../../../../assets/img/analytics-category-background.png',
        logo: '../../../../assets/img/analytics-category-icon.svg',
        color: '#907cfe'
      },
      {
        background: '../../../../assets/img/communication-category-background.png',
        logo: '../../../../assets/img/communication-category-icon.svg',
        color: '#ff6262'
      },
      {
        background: '../../../../assets/img/management-category-background.png',
        logo: '../../../../assets/img/management-category-icon.svg',
        color: '#81cf7c'
      },
      {
        background: '../../../../assets/img/analytics-category-background.png',
        logo: '../../../../assets/img/productivity-category-icon.svg',
        color: '#907cfe'
      },
      {
        background: '../../../../assets/img/tool-category-background.png',
        logo: '../../../../assets/img/tool-category-icon.svg',
        color: '#4691de'
      }
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
            valueId: data.id
          }
        };
        this.categories.push(category);
        categoryIndex++;
      });
    }
  }

  getSidebarFilters(filters: Filter []) {
    this.sidebarFilters = [...filters];
    for (const filterModel of this.sidebarFilters) {
      filterModel.values = filterModel.values.map(filterValue => {
        return {
          ...filterValue,
          checked: false
        };
      });
    }
  }

  getFilters() {
    this.loader.start();
    this.subscriber.add(
      this.frontendService.getFilters().subscribe(result => {
        this.getCategoriesToExplore(result.list);
        this.getSidebarFilters(result.list);
        this.loader.complete();
      }, () => this.loader.complete())
    );
  }

  catchSearchText(searchText: string) {
    this.router.navigate(
        ['app/browse', this.DEFAULT_FILTER_ID, this.DEFAULT_FILTER_VALUE_ID],
        {queryParams: {search: searchText}}).then();
  }

  onSidebarFilterChange(filter: Filter, sidebarSelectModel: OcSidebarSelectModel) {
    if(sidebarSelectModel) {
      let selectValueId = '';
      if(sidebarSelectModel?.parent) {
        sidebarSelectModel.parent.checked = true;
        selectValueId = sidebarSelectModel.parent.id;
      }
      this.router.navigate(['app/browse', filter.id, selectValueId]).then();
    }
  }

  goToAppDetails(appData: FullAppData) {
    this.router.navigate(['details', appData.safeName[0]]).then();
  }
}
