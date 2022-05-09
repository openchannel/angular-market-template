import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppsService, FrontendService } from '@openchannel/angular-common-services';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActionButton, actionButtons, pageConfig, uninstallButton } from 'assets/data/configData';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { Router } from '@angular/router';
import { FullAppData, DropdownModel } from '@openchannel/angular-common-components';
import { ButtonActionService } from '@features/button-action/button-action.service';
import { CustomDataAppConfig } from '@openchannel/angular-common-components/src/lib/common-components';

class LocalFullAppData extends FullAppData {
    listingActions: ActionButton[];
    constructor(appData: any, customDataConfig: CustomDataAppConfig, listingActions: ActionButton[]) {
        super(appData, customDataConfig);
        this.listingActions = listingActions;
    }
}

@Component({
    selector: 'app-my-apps',
    templateUrl: './my-apps.component.html',
    styleUrls: ['./my-apps.component.scss'],
})
export class MyAppsComponent implements OnInit, OnDestroy {
    appList: LocalFullAppData[] = [];
    appSorts: DropdownModel<string>[];
    selectedSort: DropdownModel<string>;
    appsLoaded = false;
    appOptions: ActionButton[] = actionButtons;

    private pageNumber = 1;
    private destroy$ = new Subject();

    private loader: LoadingBarState;

    constructor(
        private appsService: AppsService,
        private router: Router,
        private frontendService: FrontendService,
        private loadingBar: LoadingBarService,
        private buttonActionService: ButtonActionService,
    ) {}

    ngOnInit(): void {
        this.loader = this.loadingBar.useRef();
        this.loader.start();

        this.frontendService
            .getSorts()
            .pipe(
                finalize(() => {
                    this.loader.complete();
                }),
                takeUntil(this.destroy$),
            )
            .subscribe(page => {
                this.appSorts = page.list[0] ? page.list[0].values.map(value => new DropdownModel<string>(value.label, value.sort)) : null;
                if (this.appSorts) {
                    this.selectedSort = this.appSorts[0];
                }

                this.loadApps();
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.loader?.complete();
    }

    onSortChange(selected: DropdownModel<string>): void {
        this.pageNumber = 1;
        this.appList = [];
        this.selectedSort = selected;
        this.loadApps();
    }

    onScrollDown(): void {
        if (this.appList.length > 0) {
            this.pageNumber++;
            this.loadApps();
        }
    }

    goBack(): void {
        history.back();
    }

    navigateTo(parts: any[]): void {
        this.router.navigate(parts).then();
    }

    onUpdateAppData(): void {
        this.appList = [];
        this.loadApps();
    }

    private loadApps(): void {
        const sort = this.selectedSort ? this.selectedSort.value : '';
        this.appsService
            .getApps(this.pageNumber, 5, sort, '', true)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                res => {
                    this.appList = [
                        ...this.appList,
                        ...res.list.map(
                            app =>
                                new LocalFullAppData(app, pageConfig.fieldMappings, [
                                    ...this.buttonActionService.canBeShow(app, actionButtons),
                                ]),
                        ),
                    ];
                    this.appsLoaded = true;
                },
                error => this.loader.complete(),
                () => this.loader.complete(),
            );
    }
}
