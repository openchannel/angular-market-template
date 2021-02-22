import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AppsService,
  Filter,
  FrontendService,
  FullAppData, OcSidebarSelectModel,
  Page, SidebarValue, TitleService
} from 'oc-ng-common-service';
import { map, takeUntil, tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { pageConfig } from '../../../../assets/data/configData';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';

@Component({
  selector: 'app-app-search',
  templateUrl: './app-search.component.html',
  styleUrls: ['./app-search.component.scss']
})
export class AppSearchComponent implements OnDestroy, OnInit {

  searchText: string;
  searchTextTag: string;
  appPage: Page<FullAppData>;
  filters: Filter[] = [];
  selectedFilterValues: {
    filterId: string;
    value: SidebarValue;
  }[];

  loadFilters$: Observable<Page<Filter>>;

  loader: LoadingBarState;

  private destroy$: Subject<void> = new Subject();

  public readonly SINGLE_FILTER = 'collections';

  constructor(private appService: AppsService,
              private frontendService: FrontendService,
              private router: ActivatedRoute,
              private loadingBar: LoadingBarService,
              private route: Router,
              private titleService: TitleService) {}

  ngOnInit() {
    this.loader = this.loadingBar.useRef();
    this.searchText = this.router.snapshot.queryParamMap.get('searchText');
    const filterId = this.router.snapshot.queryParamMap.get('filterId');
    const filterValueId = this.router.snapshot.queryParamMap.get('valueId');

    this.loader.start();

    this.loadFilters$ = this.frontendService.getFilters()
        .pipe(takeUntil(this.destroy$));

    this.loadFilters$
        .subscribe(data => {
          this.filters = data.list;

          for (const filterModel of this.filters) {
            filterModel.values = filterModel.values.map(filterValue => {
              return {
                ...filterValue,
                checked: filterId === filterModel.id && filterValue.id === filterValueId,
              };
            });
          }

          this.loader.complete();

          if (this.searchText) {
            this.onTextChange(this.searchText);
          } else {
            this.selectedFilterValues = this.getSelectedFilterValues();
            this.getSortedData(filterId, filterValueId)
          }
        });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if(this.loader) {
      this.loader.complete();
    }
  }

  searchAppObservable(text: string, sort: string): Observable<Page<FullAppData>> {
    this.loader.start();

    return this.appService.searchApp(text, sort)
        .pipe(takeUntil(this.destroy$),
              map((data: Page<FullAppData>) => {
                data.list = data.list.map(value => new FullAppData(value, pageConfig.fieldMappings));
                return data;
              }),
              tap((data: Page<FullAppData>) => this.appPage = data));
  }

  getData(): void {
    this.searchAppObservable(this.searchText, this.getFilterQuery())
        .subscribe(() => this.loader.complete(),
            () => this.loader.complete());
  }

  getSortedData(filterId: string, valueId: string) {
    let filter: string;
    let sort: string;

    this.loader.start();

    pageConfig.appListPage.forEach(list => {
      if (list.valueId === valueId && list.filterId === filterId) {
        filter = list.filter;
        sort = list.sort;
      }
    });
    this.appService.getApps(1, 100, sort, filter)
      .pipe(takeUntil(this.destroy$),
        map((data: Page<FullAppData>) => {
          data.list = data.list.map(value => new FullAppData(value, pageConfig.fieldMappings));
          return data;
        }),
        tap((data: Page<FullAppData>) => this.appPage = data))
      .subscribe(() => this.loader.complete(),
        () => this.loader.complete());
  }

  onSingleFilterChange(currentFilter: Filter, singleFilterValue: OcSidebarSelectModel): void {
    const parentCheckedValue = singleFilterValue.parent?.checked;
    this.filters.forEach(filter => {
      filter?.values?.forEach(value => {
        if (value?.checked) {
          value.checked = false;
        }
      });
    });
    singleFilterValue.parent.checked = !parentCheckedValue;
    this.getData();
  }

  onMultiFilterChange(currentFilter: Filter, multiFilterValue: OcSidebarSelectModel): void {
    multiFilterValue.parent.checked = !multiFilterValue.parent?.checked;
    this.getData();
  }

  onFilterChange() {
    this.getData();
  }

  onTextChange(text: string) {
    this.searchTextTag = text;
    this.searchAppObservable(text, this.getFilterQuery()).subscribe(
      () => this.loader.complete(),
          () =>  this.loader.complete()
    );
  }

  hasCheckedValue(filter: Filter): boolean {
    return filter.values.findIndex(value => value.checked) > -1;
  }

  goToAppDetails(app: FullAppData) {
    this.route.navigate(['/details', app.safeName[0]]);
  }

  disableFilterValue(filterId: string, filterValue: SidebarValue): void {
    const currentFilter = this.filters.filter(filter => filter.id === filterId)[0];
    if(filterId === this.SINGLE_FILTER) {
      this.onSingleFilterChange(currentFilter, {parent: filterValue, child: filterValue});
    } else {
      this.onMultiFilterChange(currentFilter, {parent: filterValue, child: filterValue});
    }
  }

  clearSearchText() {
    this.searchText = '';
    this.onTextChange('');
  }

  private getFilterQuery() {

    let filterValues = this.getSelectedFilterValues();
    let queries = filterValues.map(filterValue => filterValue.value.query).filter(q => q);

    this.selectedFilterValues = filterValues;

    return queries.length > 0 ? `{ "$and":[${queries.join(',')}] }` : null;
  }

  private getSelectedFilterValues(): {filterId: string, value: SidebarValue} [] {
    const filterValues: {filterId: string; value: SidebarValue }[] = [];
    const filterLabels = [];
    this.filters.forEach(filter => {
      filter.values.forEach(value => {
        if (value.checked) {
          const sidebarValue = <SidebarValue> value;
          filterValues.push({filterId: filter.id, value: sidebarValue});
          filterLabels.push(filter.name);
        }
      });
    });
    this.titleService.setSpecialTitle(filterLabels.join(', '));
    return filterValues;
  }
}
