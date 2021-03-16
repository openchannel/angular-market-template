import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {
  AppsService,
  Filter,
  FrontendService,
  FullAppData, OcSidebarSelectModel,
  Page, SidebarValue, TitleService
} from 'oc-ng-common-service';
import { map, takeUntil, tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import { pageConfig } from '../../../../assets/data/configData';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import {HttpParams} from '@angular/common/http';
import {isString, forEach} from 'lodash';

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
              private activatedRouter: ActivatedRoute,
              private loadingBar: LoadingBarService,
              private router: Router,
              private titleService: TitleService,
              private location: Location) {}

  ngOnInit() {
    this.loader = this.loadingBar.useRef();
    this.searchText = this.activatedRouter.snapshot.queryParamMap.get('search');

    const filterValues: any = {};

    // put filter values from the URL path
    const filterId = this.activatedRouter.snapshot.paramMap.get('filterId');
    const filterValueId = this.activatedRouter.snapshot.paramMap.get('valueId');
    if(filterId && filterValueId) {
      filterValues[filterId] = [filterValueId];
    }
    // put filter values from the URL params
    const queryParams = {...this.activatedRouter.snapshot.queryParams};
    delete queryParams['search'];

    forEach(queryParams, (value, key) => {
      if(isString(value)) {
        filterValues[key] = queryParams[key].split(',');
      } else {
        filterValues[key] = queryParams[key];
      }
    });

    this.loader.start();

    this.loadFilters$ = this.frontendService.getFilters()
        .pipe(takeUntil(this.destroy$));

    this.loadFilters$
        .subscribe(data => {
          this.filters = data.list;

          for (const filterModel of this.filters) {
            let checkedValues = filterValues[filterModel.id] as string [];
            filterModel.values = filterModel.values.map(filterValue => {
              return {
                ...filterValue,
                checked: checkedValues?.includes(filterValue.id),
              };
            });
          }

          this.loader.complete();

          this.selectedFilterValues = this.getSelectedFilterValues();

          if(filterId && filterValueId ){
            this.getSortedData(filterId, filterValueId)
          } else {
            this.onTextChange(this.searchText);
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
    this.updateCurrentUrlPath();
    this.searchAppObservable(this.searchText, this.getFilterQuery())
        .subscribe(() => this.loader.complete(),
            () => this.loader.complete());
  }

  getSortedData(filterId: string, valueId: string) {
    let filter: string = null;
    let sort: string = null;

    pageConfig.appListPage.forEach(list => {
      if (list.valueId === valueId && list.filterId === filterId) {
        filter = list.filter;
        sort = list.sort;
      }
    });

    if (filter || sort) {
      this.updateCurrentUrlPath();
      this.loader.start();
      this.appService.getApps(1, 100, sort, filter)
      .pipe(takeUntil(this.destroy$),
          map((data: Page<FullAppData>) => {
            data.list = data.list.map(value => new FullAppData(value, pageConfig.fieldMappings));
            return data;
          }),
          tap((data: Page<FullAppData>) => this.appPage = data))
      .subscribe(() => this.loader.complete(), () => this.loader.complete());

    } else {
      this.getData();
    }
  }

  onSingleFilterChange(currentFilter: Filter, filterValue: OcSidebarSelectModel,
                       cleanAnotherFilters: boolean): void {
    this.updateFilterValues(false, currentFilter,
        filterValue, cleanAnotherFilters, true);
  }

  onMultiFilterChange(currentFilter: Filter, filterValue: OcSidebarSelectModel): void {
    this.updateFilterValues(true, currentFilter,
        filterValue, false, false);
  }

  updateFilterValues(isMultiFilter: boolean,
                     currentFilter: Filter, selectModel: OcSidebarSelectModel,
                     cleanAnotherFilters: boolean,
                     cleanValuesFromCurrentFilter: boolean) {
    const currentParentValue = selectModel?.parent?.checked;
    this.filters.forEach(filter => {

      const isCurrentFilter = selectModel?.parent?.id == filter?.id;

      let cleanRequired;

      if (isCurrentFilter) {
        cleanRequired = cleanValuesFromCurrentFilter;
      } else {
        cleanRequired = cleanAnotherFilters;
      }

      if (cleanRequired) {
        filter?.values?.forEach(value => {
          if (value?.checked) {
            value.checked = false;
          }
        });
      }
    });
    selectModel.parent.checked = !currentParentValue;
    this.getData();
  }

  onFilterChange() {
    this.getData();
  }

  onTextChange(text: string) {
    this.searchTextTag = text;
    this.getData();
  }

  hasCheckedValue(filter: Filter): boolean {
    return filter.values.findIndex(value => value.checked) > -1;
  }

  goToAppDetails(app: FullAppData) {
    this.router.navigate(['/details', app.safeName[0]]);
  }

  disableFilterValue(filterId: string, filterValue: SidebarValue): void {
    const filterValueModel = {
      parent: filterValue,
      child: filterValue
    }
    const currentFilter = this.filters.filter(filter => filter.id === filterId)[0];
    if(filterId === this.SINGLE_FILTER) {
      this.onSingleFilterChange(currentFilter, filterValueModel, false);
    } else {
      this.onMultiFilterChange(currentFilter, filterValueModel);
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
          filterLabels.push(value.label);
        }
      });
    });
    this.titleService.setSpecialTitle(filterLabels.join(', '));
    return filterValues;
  }

  private updateCurrentUrlPath() : void {

    const selectedFilters = this.getSelectedFilterValues();

    const urlFilterData: any = {};

    selectedFilters.forEach(filterValue => {
      let values = urlFilterData[filterValue.filterId] as string[];
      urlFilterData[filterValue.filterId] = values ? [...values, filterValue.value.id] : [filterValue.value.id];
    });

    const urlFilterDataKeys = Object.keys(urlFilterData);

    let isMonoFilterId = urlFilterDataKeys.length === 1;
    let isMonoValueId = true;

    urlFilterDataKeys.forEach(key => {
      const filterValueIdArray = urlFilterData[key];
      if(isMonoValueId && filterValueIdArray?.length !== 1) {
        isMonoValueId = false;
      }
      urlFilterData[key] = (urlFilterData[key] as string []).join(',');
    });

    if(isMonoFilterId && isMonoValueId) {
      this.replaceCurrentURL(urlFilterDataKeys[0], urlFilterData[urlFilterDataKeys[0]], this.searchText, {});
    } else {
      this.replaceCurrentURL(null, null, this.searchText, urlFilterData);
    }
  }

  private replaceCurrentURL(filterId: string, filterValueId: string, searchText: string, queryParams: any): void {
    let httpParams = new HttpParams({fromObject: queryParams});
    httpParams = this.updateSearchTextQueryParam(searchText, httpParams);
    const filterPath = filterId && filterValueId ? `/${filterId}/${filterValueId}` : '';
   this.location.replaceState(`browse${filterPath}`, httpParams.toString());
  }

  private updateSearchTextQueryParam(searchText: string, queryParams: HttpParams): HttpParams {
    if(searchText) {
      return queryParams.set('search', searchText);
    } else {
      return queryParams.delete('search');
    }
  }
}
