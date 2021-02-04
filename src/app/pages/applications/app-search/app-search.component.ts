import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppsService, Filter, FrontendService, FullAppData, Page } from 'oc-ng-common-service';
import { debounceTime, distinctUntilChanged, map, mergeMap, takeUntil, tap } from 'rxjs/operators';
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
  appPage: Page<FullAppData>;
  filters: Filter[];
  selectedFilterLabels: string[] = [];

  loadFilters$: Observable<Page<Filter>>;
  textChange$: Subject<string> = new Subject();

  loader: LoadingBarState;

  private destroy$: Subject<void> = new Subject();

  constructor(private appService: AppsService,
              private frontendService: FrontendService,
              private router: ActivatedRoute,
              private loadingBar: LoadingBarService,
              private route: Router) {}

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
            this.getData();
          } else {
            this.getSortedData(filterId, filterValueId)
          }
        });
    this.subscribeToSearchChange();
  }

  ngOnDestroy(): void {
    this.textChange$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  subscribeToSearchChange(): void {
    this.textChange$
        .pipe(
            takeUntil(this.destroy$),
            debounceTime(300),
            distinctUntilChanged(),
            mergeMap((value: string) => this.searchAppObservable(value, this.getFilterQuery())))
        .subscribe(() => this.loader.complete(),
            () =>  this.loader.complete());
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

  onFilterChange() {
    this.getData();
  }

  onTextChange(text: string) {
    this.textChange$.next(text);
  }

  hasCheckedValue(filter: Filter): boolean {
    return filter.values.findIndex(value => value.checked) > -1;
  }

  goToAppDetails(app: FullAppData) {
    this.route.navigate(['/details', app.safeName[0]]);
  }

  private getFilterQuery() {
    const queries: string[] = [];
    this.selectedFilterLabels = [];

    this.filters.forEach(filter => {
      filter.values.forEach(value => {
        if (value.checked) {
          queries.push(value.query);
          this.selectedFilterLabels.push(value.label);
        }
      });
    });
    return queries.length > 0 ? `{ "$and":[${queries.join(',')}] }` : null;
  }
}
