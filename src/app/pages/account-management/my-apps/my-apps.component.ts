import { Component, OnInit } from '@angular/core';
import {AppsService, AuthHolderService, DropdownModel, FrontendService, FullAppData} from 'oc-ng-common-service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {pageConfig} from '../../../../assets/data/configData';
import {LoaderService} from '@core/services/loader.service';

@Component({
  selector: 'app-my-apps',
  templateUrl: './my-apps.component.html',
  styleUrls: ['./my-apps.component.scss']
})
export class MyAppsComponent implements OnInit {

  private destroy$ = new Subject();
  appList: FullAppData[] = [];
  appSorts: DropdownModel<string>[];
  selectedSort: DropdownModel<string>;

  private readonly appQuery = JSON.stringify({
    userId: this.authHolderService.userDetails.organizationId,
    isOwner: true,
  });

  private pageNumber = 1;

  constructor(private appsService: AppsService,
              private frontendService: FrontendService,
              private loaderService: LoaderService,
              private authHolderService: AuthHolderService) { }

  ngOnInit(): void {
    this.loaderService.showLoader('sorts');

    this.frontendService.getSorts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(page => {
        this.appSorts = page.list[0] ?
          page.list[0].values.map(value => new DropdownModel<string>(value.label, value.sort)) : null;
        this.selectedSort = this.appSorts[0];

        this.loadApps();
      },
        error => this.loaderService.closeLoader('sorts'),
        () => this.loaderService.closeLoader('sorts'));
  }

  private loadApps() {
    this.loaderService.showLoader('apps');

    this.appsService.getApps(this.pageNumber, 5, this.selectedSort ? this.selectedSort.value : '', this.appQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.appList = [...this.appList, ...res.list.map(app => new FullAppData(app, pageConfig.fieldMappings))];
      },
        error => this.loaderService.closeLoader('apps'),
        () => this.loaderService.closeLoader('apps'));
  }

  onSortChange(selected: DropdownModel<string>) {
    this.pageNumber = 1;
    this.appList = [];
    this.selectedSort = selected;
    this.loadApps();
  }

  onScrollDown() {
    this.pageNumber++;
    this.loadApps();
  }
}
