import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppListing } from '@openchannel/angular-common-components';
import {
    AppsService,
    Transaction,
    TransactionsService,
    FullTransaction,
    TransactionOptions,
    FileUploadDownloadService,
    TransactionStatus,
} from '@openchannel/angular-common-services';
import { catchError, map, mergeMap, takeUntil } from 'rxjs/operators';
import { Observable, Subject, throwError } from 'rxjs';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';

@Component({
    selector: 'app-billing-history',
    templateUrl: './billing-history.component.html',
    styleUrls: ['./billing-history.component.scss'],
})
export class BillingHistoryComponent implements OnInit, OnDestroy {
    transactionsListing: AppListing = {
        layout: 'table',
        data: {
            pages: 1,
            pageNumber: 1,
            list: [],
            count: 1,
        },
        options: [],
    };
    activeColumns = ['app-name', 'date', 'amount', 'status', 'app-options'];
    transactionsLoaded = false;

    defaultAppIconSrc = 'assets/img/app-icon.svg';

    sortState = {
        date: -1,
    };

    private page = 1;

    private loader: LoadingBarState;
    private $destroy: Subject<void> = new Subject<void>();

    constructor(
        private appsService: AppsService,
        private transactionsService: TransactionsService,
        private fileDownloadService: FileUploadDownloadService,
        private loadingBar: LoadingBarService,
    ) {}

    ngOnInit(): void {
        this.loader = this.loadingBar.useRef();
        this.getTransactionsList();
    }

    ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
        this.loader?.complete();
    }

    changeSortByKey(key: string): void {
        this.sortState[key] = this.sortState[key] * -1;
        this.page = 1;
        this.getTransactionsList(true);
    }

    handleOptionClick(option: TransactionOptions, transaction: FullTransaction): void {
        switch (option) {
            case 'Download invoice':
                window.open(transaction.invoiceUrl);
                break;
            case 'View receipt':
                window.open(transaction.recieptUrl);
                break;
            default:
                return;
        }
    }

    handlePageScrolled(): void {
        this.page++;
        this.getTransactionsList();
    }

    private getTransactionsList(startNewPagination: boolean = false): void {
        this.loader.start();

        this.transactionsService
            .getTransactionsList(this.page, 20, this.sortState)
            .pipe(
                mergeMap(transactions => {
                    return this.getTransactionsWithAppInfo(transactions.list).pipe(
                        // Left all Page information, but replace list with transactions with full info
                        map(fullTransactions => ({ ...transactions, list: fullTransactions })),
                    );
                }),
                // Add fields to transactions
                map(transactions => ({
                    ...transactions,
                    list: transactions.list.map(transaction => {
                        return {
                            ...transaction,
                            options: this.getTransactionOptions(transaction),
                            status: this.getTransactionStatus(transaction),
                        };
                    }),
                })),
                catchError(err => {
                    this.loader.complete();
                    return throwError(err);
                }),
                takeUntil(this.$destroy),
            )
            .subscribe(res => {
                this.transactionsListing.data = {
                    ...res,
                    list: startNewPagination ? res.list : [...this.transactionsListing.data.list, ...res.list],
                };

                this.transactionsLoaded = true;
                this.loader.complete();
            });
    }

    private getTransactionsWithAppInfo(transactions: Transaction[]): Observable<FullTransaction[]> {
        const appsIds = [...new Set(transactions.map(transaction => transaction.appId))];
        const query = JSON.stringify({ appId: { $in: appsIds } });

        return this.appsService.getApps(1, 100, null, query).pipe(
            map(apps => {
                // Create appsMap, so we can easily find app by id later
                const appsMap = {};
                apps.list.forEach(app => (appsMap[app.appId] = app));

                return transactions.map(transaction => ({
                    ...transaction,
                    appName: appsMap[transaction.appId]?.name || '',
                    appIcon: appsMap[transaction.appId]?.icon || this.defaultAppIconSrc,
                }));
            }),
            takeUntil(this.$destroy),
        );
    }

    private getTransactionStatus(transaction: Transaction): TransactionStatus {
        return transaction.type === 'refund' ? 'Refunded' : 'Successful';
    }

    private getTransactionOptions(transaction: Transaction): TransactionOptions[] {
        const options: TransactionOptions[] = [];

        if (transaction.recieptUrl) {
            options.push('View receipt');
        }
        if (transaction.invoiceUrl) {
            options.push('Download invoice');
        }

        return options;
    }
}
