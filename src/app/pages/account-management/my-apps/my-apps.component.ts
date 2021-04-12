import { Component, OnDestroy, OnInit } from '@angular/core';
import {AppsService, DropdownModel, FrontendService, FullAppData} from 'oc-ng-common-service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {pageConfig} from '../../../../assets/data/configData';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-apps',
  templateUrl: './my-apps.component.html',
  styleUrls: ['./my-apps.component.scss']
})
export class MyAppsComponent implements OnInit, OnDestroy {

  appList: FullAppData[] = [];
  appSorts: DropdownModel<string>[];
  selectedSort: DropdownModel<string>;

  private pageNumber = 1;
  private destroy$ = new Subject();

  private loader: LoadingBarState;

  constructor(
      private appsService: AppsService,
      private router: Router,
      private frontendService: FrontendService,
      private loadingBar: LoadingBarService
  ) {}

  ngOnInit(): void {
    this.loader = this.loadingBar.useRef();
    this.loader.start();

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
        error => this.loader.complete(),
        () => this.loader.complete());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadApps() {
    const sort = this.selectedSort ? this.selectedSort.value : '';
    this.appsService.getApps(this.pageNumber, 5, sort, '', true)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.appList = [...this.appList, ...res.list.map(app => new FullAppData(app, pageConfig.fieldMappings))];
      },
        error => this.loader.complete(),
        () => this.loader.complete());
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

  goBack() {
    history.back();
  }

  navigateTo(parts: any []): void {
    this.router.navigate(parts).then();
  }
}
