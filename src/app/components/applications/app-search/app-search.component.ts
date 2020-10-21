import {AfterViewInit, Component, OnDestroy, ViewChild} from '@angular/core';
import {Application, AppsService, Page} from 'oc-ng-common-service';
import {debounceTime, distinctUntilChanged, mergeMap, takeUntil, tap} from "rxjs/operators";
import {Subject} from "rxjs";
import {OcTextSearchComponent} from "oc-ng-common-component";
import {LoaderComponent} from "../../../shared/custom-components/loader/loader.component";

@Component({
  selector: 'app-app-search',
  templateUrl: './app-search.component.html',
  styleUrls: ['./app-search.component.scss']
})
export class AppSearchComponent implements AfterViewInit, OnDestroy {

  @ViewChild('searchInput') searchInput: OcTextSearchComponent;
  @ViewChild('loader') loader: LoaderComponent;

  searchText: string;
  appPage: Page<any>;

  private destroy$: Subject<void> = new Subject();

  constructor(private appService: AppsService) {}

  ngAfterViewInit(): void {
    this.searchInput.searchTextChange
        .pipe(
            takeUntil(this.destroy$),
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.loader.toggle()),
            mergeMap((value: string) => this.appService.searchApp(value)))
        .subscribe((data: Page<Application>) => {
          this.appPage = data;
          this.loader.toggle()
        }, error => this.loader.toggle());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
