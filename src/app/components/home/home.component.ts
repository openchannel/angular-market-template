import { Component, OnDestroy, OnInit } from '@angular/core';
import { BasicAppDetails, AppCategoryDetail, FullAppData, AppsService } from 'oc-ng-common-service';
import { AppsServiceImpl } from '../../core/services/apps-services/model/apps-service-impl';
import { FilterValue } from '../../core/services/apps-services/model/apps-model';
import { Subscription } from 'rxjs';
import { pageConfig } from '../../../assets/data/configData';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  public featuredApp: FullAppData[] = [];
  public categories: AppCategoryDetail[];

  public appsFilter: FilterValue [] = [];
  public isFeatured = false;
  public homePageConfig;
  private subscriber: Subscription = new Subscription();

  constructor(private appService: AppsService) { }

  ngOnInit(): void {
    this.getPageConfig();
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }

  getPageConfig(): void {
    this.homePageConfig = pageConfig;
    this.getFeaturedApps();
    this.appsForCategory();
    this.getCategoriesToExplore();
  }

  // Getting featured apps separately
  getFeaturedApps(): void {
    if (this.homePageConfig && this.homePageConfig.appListPage && this.homePageConfig.appListPage.length > 0) {
      const featureConfig = this.homePageConfig.appListPage.find(filer => filer.type.includes('featured-apps'));
      if(featureConfig) {
        this.subscriber.add(
          this.appService.getApps(1, 6, featureConfig.sort, featureConfig.filter)
            .subscribe(res => {
              this.featuredApp = res.list.map(app => new FullAppData(app, this.homePageConfig.fieldMappings));
              if (this.featuredApp && this.featuredApp.length > 0) {
                this.isFeatured = true;
              }
            })
        );
      }
    }
  }

// Getting apps for each filter from page config
  appsForCategory(): void {
    this.homePageConfig.appListPage.forEach(element => {
      if (element.type !== 'featured-apps' && element.type !== 'search' &&
        element.type !== 'filter-values-card-list') {
        this.subscriber.add(
          this.appService.getApps(1, 6, element.sort, element.filter)
            .subscribe(res => {
              element.data = res.list.map(app => new FullAppData(app, this.homePageConfig.fieldMappings));
            })
        );
      }
    });
  }

  getCategoriesToExplore() {
    const appCategory1 = new AppCategoryDetail();
    appCategory1.categoryCardClass = 'category-card';
    appCategory1.categoryLogo = '../../../../assets/img/all-apps-category-icon.svg';
    appCategory1.categoryName = 'All Apps';
    appCategory1.categoryQuery = {filterId: 'collections', valueId: 'allApps'};

    const appCategory2 = new AppCategoryDetail();
    appCategory2.categoryCardClass = 'category-card';
    appCategory2.categoryLogo = '../../../../assets/img/analytics-category-icon.svg';
    appCategory2.categoryName = 'Analytics';
    appCategory2.categoryQuery = {filterId: 'categories', valueId: 'analytics'};
    appCategory2.categoryBackgroundImage = '../../../../assets/img/analytics-category-background.png'


    const appCategory3 = new AppCategoryDetail();
    appCategory3.categoryCardClass = 'category-card';
    appCategory3.categoryLogo = '../../../../assets/img/communication-category-icon.svg';
    appCategory3.categoryName = 'Communication';
    appCategory3.categoryQuery = {filterId: 'categories', valueId: 'communication'};
    appCategory3.categoryBackgroundImage = '../../../../assets/img/communication-category-background.png'

    this.categories = [appCategory1, appCategory2, appCategory3];
  }
}
