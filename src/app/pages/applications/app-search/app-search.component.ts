import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AppsService, FilterResponse, FrontendService, Page, TitleService } from '@openchannel/angular-common-services';
import { map, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { pageConfig } from '../../../../assets/data/configData';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { HttpParams } from '@angular/common/http';
import { isString, forEach } from 'lodash';
import {
    Filter,
    FilterValue,
    FullAppData,
    OcSidebarSelectModel,
    SelectedFilter,
    SidebarValue,
} from '@openchannel/angular-common-components';

@Component({
    selector: 'app-app-search',
    templateUrl: './app-search.component.html',
    styleUrls: ['./app-search.component.scss'],
})
export class AppSearchComponent implements OnDestroy, OnInit {
    isHideFilter = true;

    searchText: string;
    searchTextTag: BehaviorSubject<string> = new BehaviorSubject<string>('');
    appPage: Page<FullAppData>;
    filters: Filter[] = [];
    selectedFilterValues: BehaviorSubject<SelectedFilter[]> = new BehaviorSubject<SelectedFilter[]>([]);
    tagsTitles: string[] = [];

    loadFilters$: Observable<Page<FilterResponse>>;

    loader: LoadingBarState;
    private destroy$: Subject<void> = new Subject();

    readonly SINGLE_FILTER = 'collections';

    constructor(
        private appService: AppsService,
        private frontendService: FrontendService,
        private activatedRouter: ActivatedRoute,
        private loadingBar: LoadingBarService,
        private router: Router,
        private titleService: TitleService,
        private location: Location,
    ) {}

    ngOnInit(): void {
        this.loader = this.loadingBar.useRef();
        this.searchText = this.activatedRouter.snapshot.queryParamMap.get('search')?.trim();
        this.searchTextTag.next(this.searchText);

        const filterValues: any = {};

        // put filter values from the URL path
        const filterId = this.activatedRouter.snapshot.paramMap.get('filterId');
        const filterValueId = this.activatedRouter.snapshot.paramMap.get('valueId');
        if (filterId && filterValueId) {
            filterValues[filterId] = [filterValueId];
        }
        // put filter values from the URL params
        const queryParams = { ...this.activatedRouter.snapshot.queryParams };
        delete queryParams.search;

        forEach(queryParams, (value, key) => {
            filterValues[key] = isString(value) ? queryParams[key].split(',') : queryParams[key];
        });

        this.loader.start();

        this.loadFilters$ = this.frontendService.getFilters().pipe(takeUntil(this.destroy$));

        this.loadFilters$.subscribe(data => {
            this.filters = data.list;

            this.filters.forEach(filter => {
                const checkedValues = filterValues[filter.id] as string[];
                if (checkedValues) {
                    filter.values.forEach(value => this.findAndCheckChildFilter(value as SidebarValue, checkedValues));
                }
            });

            this.loader.complete();

            this.selectedFilterValues.next(this.getSelectedFilterValues());

            if (filterId && filterValueId) {
                this.getSortedData(filterId, filterValueId);
            } else {
                this.onTextChange(this.searchText);
            }

            this.subscribeToSearchTags();
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.loader) {
            this.loader.complete();
        }
    }

    searchAppObservable(text: string, sort: string): Observable<Page<FullAppData>> {
        this.loader.start();

        return this.appService.searchApp(text, sort).pipe(
            takeUntil(this.destroy$),
            map((data: Page<FullAppData>) => {
                data.list = data.list.map(value => new FullAppData(value, pageConfig.fieldMappings));
                return data;
            }),
            tap((data: Page<FullAppData>) => (this.appPage = data)),
        );
    }

    getData(): void {
        this.updateCurrentUrlPath();
        this.searchAppObservable(this.searchText, this.getFilterQuery()).subscribe(
            () => this.loader.complete(),
            () => this.loader.complete(),
        );
    }

    getSortedData(filterId: string, valueId: string): void {
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
            this.appService
                .getApps(1, 100, sort, filter)
                .pipe(
                    takeUntil(this.destroy$),
                    map((data: Page<FullAppData>) => {
                        data.list = data.list.map(value => new FullAppData(value, pageConfig.fieldMappings));
                        return data;
                    }),
                    tap((data: Page<FullAppData>) => (this.appPage = data)),
                )
                .subscribe(
                    () => this.loader.complete(),
                    () => this.loader.complete(),
                );
        } else {
            this.getData();
        }
    }

    onSingleFilterChange(currentFilter: Filter, filterValue: OcSidebarSelectModel): void {
        this.updateFilterValues(true, currentFilter, filterValue);
    }

    onMultiFilterChange(currentFilter: Filter, filterValue: OcSidebarSelectModel): void {
        this.updateFilterValues(false, currentFilter, filterValue);
    }

    updateFilterValues(isSingleFilter: boolean, currentFilter: Filter, selectModel: OcSidebarSelectModel): void {
        const switchedFilter = selectModel.child || selectModel.parent;
        const currentParentValue = switchedFilter?.checked;
        this.filters.forEach(filter => {
            if (isSingleFilter) {
                this.disableFilterValues(filter);
            }
        });
        switchedFilter.checked = !currentParentValue;
        this.getData();
    }

    onTextChange(text: string): void {
        this.searchText = text?.trim();
        this.searchTextTag.next(this.searchText);
        this.getData();
    }

    disableFilterValue({ parentFilterId, selectedFilterValue }: SelectedFilter): void {
        const filterValueModel = {
            parent: selectedFilterValue,
            child: selectedFilterValue,
        };
        const currentFilter = this.filters.find(filter => filter.id === parentFilterId);
        if (parentFilterId === this.SINGLE_FILTER) {
            this.onSingleFilterChange(currentFilter, filterValueModel);
        } else {
            this.onMultiFilterChange(currentFilter, filterValueModel);
        }
    }

    clearAllSearchConditions(): void {
        this.selectedFilterValues.getValue().forEach(selectedFilter => this.disableFilterValue(selectedFilter));
        this.clearSearchText();
    }

    clearSearchText(): void {
        this.searchText = '';
        this.onTextChange('');
    }

    onCollapseChanged($event: boolean): void {
        this.isHideFilter = $event;
    }

    onSearchTagDeleted(tagIndex: number): void {
        // Search tag is always last tag
        const isSearchTagDeleted = this.selectedFilterValues.getValue().length === tagIndex;

        if (isSearchTagDeleted) {
            this.clearSearchText();
        } else {
            this.disableFilterValue(this.selectedFilterValues.getValue()[tagIndex]);
        }
    }

    subscribeToSearchTags(): void {
        combineLatest([this.selectedFilterValues, this.searchTextTag])
            .pipe(
                map(([selectedFilters, searchTag]): string[] => {
                    const selectedFiltersTitles = selectedFilters.map(filter => filter.selectedFilterValue.label);

                    return searchTag ? [...selectedFiltersTitles, searchTag] : [...selectedFiltersTitles];
                }),
                takeUntil(this.destroy$),
            )
            .subscribe(tagsTitles => {
                this.tagsTitles = tagsTitles;
            });
    }

    private disableFilterValues(filter: Filter | FilterValue): void {
        filter.values?.forEach(childFilter => {
            if (childFilter.checked) {
                childFilter.checked = false;
            }
            if (childFilter.values) {
                this.disableFilterValues(childFilter);
            }
        });
    }

    private getFilterQuery(): string {
        const filterValues = this.getSelectedFilterValues();
        const queries = filterValues.map(filterValue => filterValue.selectedFilterValue.query).filter(q => q);

        this.selectedFilterValues.next(filterValues);

        return queries.length > 0 ? `{ "$and":[${queries.join(',')}] }` : null;
    }

    private getSelectedFilterValues(): SelectedFilter[] {
        const filterValues: SelectedFilter[] = [];
        this.filters.forEach(category => {
            filterValues.push(...this.getSelectedChildFilters(category, category.id));
        });

        const filterLabels = filterValues.map(value => value.selectedFilterValue.label);
        this.titleService.setSpecialTitle(filterLabels.join(', '));

        return filterValues;
    }

    private getSelectedChildFilters(filter: Filter | FilterValue, parentFilterId: string): SelectedFilter[] {
        const filterValues: SelectedFilter[] = [];
        filter.values.forEach(filterValue => {
            if (filterValue.values) {
                filterValues.push(...this.getSelectedChildFilters(filterValue, parentFilterId));
            }
            if (filterValue.checked) {
                filterValues.push({
                    parentFilterId,
                    selectedFilterValue: filterValue as SidebarValue,
                });
            }
        });
        return filterValues;
    }

    private updateCurrentUrlPath(): void {
        const selectedFilters = this.getSelectedFilterValues();

        const urlFilterData: any = {};

        selectedFilters.forEach(({ parentFilterId, selectedFilterValue }) => {
            const values = urlFilterData[parentFilterId] as string[];
            urlFilterData[parentFilterId] = values ? [...values, selectedFilterValue.id] : [selectedFilterValue.id];
        });

        const urlFilterDataKeys = Object.keys(urlFilterData);

        const isMonoFilterId = urlFilterDataKeys.length === 1;
        let isMonoValueId = true;

        urlFilterDataKeys.forEach(key => {
            const filterValueIdArray = urlFilterData[key];
            if (isMonoValueId && filterValueIdArray?.length !== 1) {
                isMonoValueId = false;
            }
            urlFilterData[key] = (urlFilterData[key] as string[]).join(',');
        });

        if (isMonoFilterId && isMonoValueId) {
            this.replaceCurrentURL(urlFilterDataKeys[0], urlFilterData[urlFilterDataKeys[0]], this.searchText, {});
        } else {
            this.replaceCurrentURL(null, null, this.searchText, urlFilterData);
        }
    }

    private replaceCurrentURL(filterId: string, filterValueId: string, searchText: string, queryParams: any): void {
        let httpParams = new HttpParams({ fromObject: queryParams });
        httpParams = this.updateSearchTextQueryParam(searchText, httpParams);
        const filterPath = filterId && filterValueId ? `/${filterId}/${filterValueId}` : '';
        this.location.replaceState(`browse${filterPath}`, httpParams.toString());
    }

    private updateSearchTextQueryParam(searchText: string, queryParams: HttpParams): HttpParams {
        if (searchText) {
            return queryParams.set('search', searchText);
        } else {
            return queryParams.delete('search');
        }
    }

    private findAndCheckChildFilter(filter: SidebarValue, checkedValues: string[]): void {
        if (filter.values && filter.values.length > 0) {
            filter.values.forEach(value => this.findAndCheckChildFilter(value, checkedValues));
            filter.expanded = !!filter.values.find(value => value.checked);
        } else {
            filter.checked = checkedValues?.includes(filter.id);
        }
    }
}
