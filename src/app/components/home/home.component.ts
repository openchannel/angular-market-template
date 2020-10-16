import { Component, OnInit } from '@angular/core';
import { FeaturedApp, BasicAppDetails, AppCategoryDetail } from 'oc-ng-common-service';
import { AppsServiceImpl } from '../../core/services/apps-services/model/apps-service-impl';
import { FilterValue } from '../../core/services/apps-services/model/apps-model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public featuredApp: FeaturedApp[] = [];
  recentlyAddedApps: BasicAppDetails[];
  categories: AppCategoryDetail[];

  public appsFilter: FilterValue [] = [];
  public isFeatured = false;
  label;

  emptyDataMessage: string;
  private subscriber: Subscription = new Subscription();

  constructor(private appService: AppsServiceImpl) { }

  ngOnInit(): void {

    const app1 = new BasicAppDetails();
    app1.appCardClass = "col-md-12";
    app1.appDescription = "With this plugin you can communicate with your teammates any time";
    app1.appLogoUrl = "https://drive.google.com/u/0/uc?id=19l7Znd-iPPYUhM6zaiQZ01rE2NpkDFyk&export=download";
    app1.appName = "Plugin";
    app1.appPrice = "Free";
    app1.rating = 3.5;
    app1.reviewCount = 12;

    const app2 = new BasicAppDetails();
    app2.appCardClass = "col-md-12";
    app2.appDescription = "Integrate directly with your account and make customer updates a breeze";
    app2.appLogoUrl = "https://drive.google.com/u/0/uc?id=1vDDzbS--o_UIgXFE_LmMfVmSAKuprCyb&export=download";
    app2.appName = "Application";
    app2.appPrice = "$11.99";
    app2.rating = 0;
    app2.reviewCount = 0;

    const app3 = new BasicAppDetails();
    app3.appCardClass = "col-md-12";
    app3.appDescription = "With this plugin you can communicate with your teammates any time";
    app3.appLogoUrl = "https://drive.google.com/u/0/uc?id=1fWkPPXp3tmkYRBy-GtCm_9PkP7fmConE&export=download";
    app3.appName = "Plugin";
    app3.appPrice = "Free";
    app3.rating = 3.5;
    app3.reviewCount = 12;

    const app4 = new BasicAppDetails();
    app4.appCardClass = "col-md-12";
    app4.appDescription = "Improve and extend your experience right from your own UI";
    app4.appLogoUrl = "https://drive.google.com/u/0/uc?id=1KipwDw0K8xJC_StaAhsyDTEgcAoVHqDp&export=download";
    app4.appName = "Integration";
    app4.appPrice = "$4.99";
    app4.rating = 4.9;
    app4.reviewCount = 87;


    this.recentlyAddedApps = [app1, app2, app3, app4, app1, app2];


    const appCategory1 = new AppCategoryDetail();
    appCategory1.categoryCardClass = 'category-card';
    appCategory1.categoryLogo = 'https://stage1-philips-market-test.openchannel.io/assets/img/item-1.png';
    appCategory1.categoryName = 'All Apps';

    const appCategory2 = new AppCategoryDetail();
    appCategory2.categoryCardClass = 'category-card';
    appCategory2.categoryLogo = 'https://stage1-philips-market-test.openchannel.io/assets/img/item-2.png';
    appCategory2.categoryName = 'Analytics';

    const appCategory3 = new AppCategoryDetail();
    appCategory3.categoryCardClass = 'category-card';
    appCategory3.categoryLogo = 'https://stage1-philips-market-test.openchannel.io/assets/img/item-3.png';
    appCategory3.categoryName = 'Communication';

    this.categories = [appCategory1, appCategory2, appCategory3];
    this.getAppFilters();
  }

  getAppFilters(): void {
    this.subscriber.add(this.appService.getAppFilters(1, 5).subscribe(
      (result) => {
        result.list.forEach(item => {
          this.appsFilter = this.appsFilter.concat(item.values);
        });
        this.getFeaturedApps();
      }
    ));
  }

  getFeaturedApps(): void {
    if (this.appsFilter && this.appsFilter.length > 0) {
      if(this.appsFilter.find(filer => filer.id.includes('featured'))) {
        this.isFeatured = true;
        this.subscriber.add(
          this.appService.getAllPublicApps(1, 10, '', 'featured')
            .subscribe(res => {
              res.list.forEach(item => {
                const oneFeature = {
                  logoUrl: item.customData?.icon,
                  appName: item.name,
                  appDescription: item.customData?.description
                }
                this.featuredApp.push(oneFeature);
              });
            })
        );
      }
    }
  }

  appsForCategory(): void {
    this.subscriber.add(
      // this.appService.getAllPublicApps(1, 10, categorySort, categoryQuery)
      //   .subscribe(res => {
      //     return res.list;
      //   })
    );
  }
}
