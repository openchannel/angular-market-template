import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppsService, FrontendService } from '@openchannel/angular-common-services';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { pageConfig } from '../../../../assets/data/configData';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { Router } from '@angular/router';
import { FullAppData, DropdownModel } from '@openchannel/angular-common-components';

@Component({
    selector: 'app-my-apps',
    templateUrl: './my-apps.component.html',
    styleUrls: ['./my-apps.component.scss'],
})
export class MyAppsComponent implements OnInit, OnDestroy {
    appList: FullAppData[] = [];
    appSorts: DropdownModel<string>[];
    selectedSort: DropdownModel<string>;
    appsLoaded = false;
    
    private pageNumber = 1;
    private destroy$ = new Subject();

    private loader: LoadingBarState;

    constructor(
        private appsService: AppsService,
        private router: Router,
        private frontendService: FrontendService,
        private loadingBar: LoadingBarService,
    ) {}

    ngOnInit(): void {
        this.loader = this.loadingBar.useRef();
        this.loader.start();

        this.frontendService
            .getSorts()
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                page => {
                    this.appSorts = page.list[0]
                        ? page.list[0].values.map(value => new DropdownModel<string>(value.label, value.sort))
                        : null;
                    if (this.appSorts) {
                        this.selectedSort = this.appSorts[0];
                    }

                    this.loadApps();
                },
                error => this.loader.complete(),
                () => this.loader.complete(),
            );
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSortChange(selected: DropdownModel<string>): void {
        this.pageNumber = 1;
        this.appList = [];
        this.selectedSort = selected;
        this.loadApps();
    }

    onScrollDown(): void {
        this.pageNumber++;
        this.loadApps();
    }

    goBack(): void {
        history.back();
    }

    navigateTo(parts: any[]): void {
        this.router.navigate(parts).then();
    }

    private loadApps(): void {
        const sort = this.selectedSort ? this.selectedSort.value : '';
        this.appsService
            .getApps(this.pageNumber, 5, sort, '', true)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                res => {
                    this.appList = [...this.appList, ...res.list.map(app => new FullAppData(app, pageConfig.fieldMappings))];
                    this.appsLoaded = true;
                },
                error => this.loader.complete(),
                () => this.loader.complete(),
            );
    }
}
