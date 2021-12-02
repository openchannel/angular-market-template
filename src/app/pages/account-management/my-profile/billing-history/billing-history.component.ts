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
import { catchError, concatMap, map, takeUntil } from 'rxjs/operators';
import { Observable, Subject, throwError } from 'rxjs';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
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
    transactionsLoaded = false;
    defaultAppIconSrc = 'assets/img/app-icon.svg';
    activeColumns = ['app-name', 'date', 'amount', 'status', 'app-options'];

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

    handleOptionClick(option: TransactionOptions, transaction: FullTransaction): void {
        switch (option) {
            case 'Download invoice':
                this.downloadByLink(transaction.invoiceUrl, 'Invoice');
                break;
            case 'Download receipt':
                this.downloadByLink(transaction.receiptUrl, 'Receipt');
                break;
            default:
                return;
        }
    }

    private downloadByLink(link: string, fileName: string): void {
        this.loader.start();

        this.fileDownloadService
            .downloadFileFromUrl(link)
            .pipe(
                catchError(err => {
                    this.loader.complete();
                    return throwError(err);
                }),
                takeUntil(this.$destroy),
            )
            .subscribe(blob => {
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                document.body.appendChild(a);
                a.style.display = 'none';
                a.href = blobUrl;
                a.download = fileName;
                a.click();
                window.URL.revokeObjectURL(blobUrl);
                a.remove();

                this.loader.complete();
            });
    }

    private getTransactionsList(): void {
        this.loader.start();

        this.transactionsService
            .getTransactionsList()
            .pipe(
                concatMap(transactions =>
                    // Request app information for each transaction
                    forkJoin(transactions.list.map(transaction => this.getTransactionWithAppInfo(transaction))).pipe(
                        // Left all Page information, but replace list with transactions with full info
                        map(fullTransactions => ({ ...transactions, list: fullTransactions })),
                    ),
                ),
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
                this.transactionsListing = { ...this.transactionsListing, data: res };
                this.transactionsLoaded = true;
                this.loader.complete();
            });
    }

    private getTransactionWithAppInfo(transaction: Transaction): Observable<FullTransaction> {
        return this.appsService.getAppById(transaction.appId).pipe(
            map(app => ({ ...transaction, appIcon: app.icon || this.defaultAppIconSrc, appName: app.name })),
            takeUntil(this.$destroy),
        );
    }

    private getTransactionStatus(transaction: Transaction): TransactionStatus {
        return transaction.type === 'refund' ? 'Refunded' : 'Successful';
    }

    private getTransactionOptions(transaction: Transaction): TransactionOptions[] {
        const options: TransactionOptions[] = [];

        if (transaction.receiptUrl) {
            options.push('Download receipt');
        }
        if (transaction.invoiceUrl) {
            options.push('Download invoice');
        }

        return options;
    }
}
