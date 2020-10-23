import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AppsService, Filter, FrontendService, FullAppData, Page} from 'oc-ng-common-service';
import {debounceTime, distinctUntilChanged, map, mergeMap, takeUntil, tap} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {pageConfig} from '../../../../assets/data/configData';
import {LoaderService} from '../../../shared/services/loader.service';

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

  private destroy$: Subject<void> = new Subject();

  constructor(private appService: AppsService,
              private frontendService: FrontendService,
              private router: ActivatedRoute,
              private loaderService: LoaderService,
              private route: Router) {}

  ngOnInit() {
    this.searchText = this.router.snapshot.queryParamMap.get('searchText');
    const filterId = this.router.snapshot.queryParamMap.get('filterId');
    const filterValueId = this.router.snapshot.queryParamMap.get('valueId');

    this.loaderService.showLoader('1');

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

          this.loaderService.closeLoader('1');

          if (this.searchText || this.getFilterQuery()) {
            this.getData();
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
        .subscribe((data: Page<FullAppData>) => this.loaderService.closeLoader('2'),
            error => this.loaderService.closeLoader('2'));
  }

  searchAppObservable(text: string, sort: string): Observable<Page<FullAppData>> {
    this.loaderService.showLoader('2');
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
        .subscribe(() => this.loaderService.closeLoader('2'),
            error => this.loaderService.closeLoader('2'));
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
    this.route.navigate(['/app-detail', app.appId]);
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
