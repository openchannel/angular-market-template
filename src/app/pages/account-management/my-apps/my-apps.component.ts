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

  appList: FullAppData[] = [];
  appSorts: DropdownModel<string>[];
  selectedSort: DropdownModel<string>;

  private pageNumber = 1;
  private destroy$ = new Subject();

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
        if (this.appSorts) {
          this.selectedSort = this.appSorts[0];
        }

        this.loadApps();
      },
        error => this.loaderService.closeLoader('sorts'),
        () => this.loaderService.closeLoader('sorts'));
  }

  private loadApps() {
    const sort = this.selectedSort ? this.selectedSort.value : '';
    this.appsService.getApps(this.pageNumber, 5, sort, '', true)
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
