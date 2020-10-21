import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AppsService, Filter, FrontendService, FullAppData, Page} from 'oc-ng-common-service';
import {debounceTime, distinctUntilChanged, map, mergeMap, takeUntil, tap} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {OcTextSearchComponent} from 'oc-ng-common-component';
import {LoaderComponent} from '../../../shared/custom-components/loader/loader.component';
import {ActivatedRoute, Router} from '@angular/router';
import {pageConfig} from '../../../../assets/data/configData';

@Component({
  selector: 'app-app-search',
  templateUrl: './app-search.component.html',
  styleUrls: ['./app-search.component.scss']
})
export class AppSearchComponent implements AfterViewInit, OnDestroy, OnInit {

  @ViewChild('searchInput') searchInput: OcTextSearchComponent;
  @ViewChild('loader') loader: LoaderComponent;

  searchText: string;
  appPage: Page<FullAppData>;
  filters: Filter[];

  private destroy$: Subject<void> = new Subject();

  constructor(private appService: AppsService,
              private frontendService: FrontendService,
              private router: ActivatedRoute,
              private route: Router) {}

  ngOnInit() {
    this.searchText = this.router.snapshot.queryParamMap.get('searchText');
    const filterId = this.router.snapshot.queryParamMap.get('filterId');
    const filterValueId = this.router.snapshot.queryParamMap.get('valueId');


    this.frontendService.getFilters()
        .pipe(takeUntil(this.destroy$))
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

          if (this.searchText || this.getFilterQuery()) {
            this.getData();
          }
        });
  }

  ngAfterViewInit(): void {
    this.searchInput.searchTextChange
        .pipe(
            takeUntil(this.destroy$),
            debounceTime(300),
            distinctUntilChanged(),
            mergeMap((value: string) => this.searchAppObservable(value, this.getFilterQuery())))
        .subscribe((data: Page<FullAppData>) => this.loader.toggle(),
                error => this.loader.toggle());
  }

  searchAppObservable(text: string, sort: string): Observable<Page<FullAppData>> {
    this.loader.toggle();
    return this.appService.searchApp(text, sort)
        .pipe(takeUntil(this.destroy$),
              map((data: Page<FullAppData>) => {
                data.list = data.list.map(value => new FullAppData(value, pageConfig.fieldMappings));
                console.log(data);
                return data;
              }),
              tap((data: Page<FullAppData>) => this.appPage = data));
  }

  getData(): void {
    this.searchAppObservable(this.searchText, this.getFilterQuery())
        .subscribe(() => this.loader.toggle(),
            error => this.loader.toggle());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFilterChange() {
    this.getData();
  }

  hasCheckedValue(filter: Filter): boolean {
    return filter.values.findIndex(value => value.checked) > -1;
  }

  goToAppDetails(app: FullAppData) {
    this.route.navigate(['/app-detail', app.appId]);
  }

  private getFilterQuery() {
    const queries: string[] = [];

    this.filters.forEach(filter => {
      filter.values.forEach(value => {
        if (value.checked) {
          queries.push(value.query);
        }
      });
    });

    return queries.length > 0 ? `{ "$and":[${queries.join(',')}] }` : null;
  }
}
