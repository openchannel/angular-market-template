import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { BillingHistoryComponent } from './billing-history.component';
import {
    MockAppsService,
    MockAppTableComponent,
    MockLoadingBarService,
    MockNgbDropdownDirective,
    MockNgbDropdownItemDirective,
    MockNgbDropdownMenuDirective,
    MockNgbDropdownToggleDirective,
    MockTransactionAmountPipe,
    MockTransactionsService,
} from '../../../../../mock/mock';
import { AppsService, Transaction, TransactionsService } from '@openchannel/angular-common-services';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { of, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { By } from '@angular/platform-browser';

describe('BillingHistoryComponent', () => {
    const getTableDE = () => fixture.debugElement.query(By.directive(MockAppTableComponent));

    const testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
    });

    let component: BillingHistoryComponent;
    let fixture: ComponentFixture<BillingHistoryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                BillingHistoryComponent,
                MockAppTableComponent,
                MockTransactionAmountPipe,
                MockNgbDropdownDirective,
                MockNgbDropdownMenuDirective,
                MockNgbDropdownToggleDirective,
                MockNgbDropdownItemDirective,
            ],
            providers: [
                { provide: AppsService, useClass: MockAppsService },
                { provide: TransactionsService, useClass: MockTransactionsService },
                { provide: LoadingBarService, useClass: MockLoadingBarService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BillingHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should complete $destroy and loader in ngOnDestroy hook', () => {
        jest.spyOn((component as any).$destroy, 'complete');
        jest.spyOn((component as any).loader, 'complete');

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnDestroy();

        expect((component as any).$destroy.complete).toHaveBeenCalled();
        expect((component as any).loader.complete).toHaveBeenCalled();
    });

    it('getTransactionsList method should be called in ngOnInit hook', () => {
        jest.spyOn(component as any, 'getTransactionsList');

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnInit();

        expect((component as any).getTransactionsList).toHaveBeenCalled();
    });

    it('getTransactionsList method should call transactionsService.getTransactionsList method with the correct page and the sort state', () => {
        jest.spyOn((component as any).transactionsService, 'getTransactionsList');

        (component as any).getTransactionsList();

        expect((component as any).transactionsService.getTransactionsList).toHaveBeenCalledWith(
            (component as any).page,
            expect.anything(),
            component.sortState,
        );
    });

    it('getTransactionsWithAppInfo method should call this.appsService.getApps method with correct query', () => {
        const appsIds = ['first-id', 'second-id', 'third-id'];
        const query = JSON.stringify({ appId: { $in: appsIds } });
        const mockTransactions = appsIds.map(appId => ({ appId }));

        jest.spyOn((component as any).appsService, 'getApps');

        (component as any).getTransactionsWithAppInfo(mockTransactions as Transaction[]);

        expect((component as any).appsService.getApps).toHaveBeenCalledWith(expect.anything(), expect.anything(), null, query);
    });

    it('getTransactionsWithAppInfo method should add app name and icon to the transaction if they exist in the app', () => {
        const appName = 'App name';
        const appIcon = 'app-icon';

        (component as any).appsService.getApps = () =>
            of({
                ...MockAppsService.MOCK_APPS_PAGE,
                list: [
                    { ...MockAppsService.MOCK_APP, name: appName, icon: appIcon, appId: MockTransactionsService.MOCK_TRANSACTION.appId },
                ],
            });

        testScheduler.run(({ expectObservable }) => {
            const transactionsWithAppInfoObservable = (component as any).getTransactionsWithAppInfo([
                MockTransactionsService.MOCK_TRANSACTION,
            ]);

            // Expect that observable will emit the transaction with app info at the 0 frame and close
            expectObservable(transactionsWithAppInfoObservable).toBe('(a|)', {
                a: [
                    {
                        ...MockTransactionsService.MOCK_TRANSACTION,
                        appName,
                        appIcon,
                    },
                ],
            });
        });
    });

    it('getTransactionsWithAppInfo method should add default app name and icon to the transaction if they do not exist in the app', () => {
        (component as any).appsService.getApps = () =>
            of({
                ...MockAppsService.MOCK_APPS_PAGE,
                list: [{ ...MockAppsService.MOCK_APP, name: null, icon: null, appId: MockTransactionsService.MOCK_TRANSACTION.appId }],
            });

        testScheduler.run(({ expectObservable }) => {
            const transactionsWithAppInfoObservable = (component as any).getTransactionsWithAppInfo([
                MockTransactionsService.MOCK_TRANSACTION,
            ]);

            // Expect that observable will emit the transaction with app info at the 0 frame and close
            expectObservable(transactionsWithAppInfoObservable).toBe('(a|)', {
                a: [
                    {
                        ...MockTransactionsService.MOCK_TRANSACTION,
                        appName: '',
                        appIcon: component.defaultAppIconSrc,
                    },
                ],
            });
        });
    });

    it('getTransactionStatus method should return "Refunded" if transaction type is a refund', () => {
        const status = (component as any).getTransactionStatus({ ...MockTransactionsService.MOCK_TRANSACTION, type: 'refund' });

        expect(status).toBe('Refunded');
    });

    it('getTransactionStatus method should return "Successful" if transaction type is not a refund', () => {
        const status = (component as any).getTransactionStatus({ ...MockTransactionsService.MOCK_TRANSACTION, type: 'payment' });

        expect(status).toBe('Successful');
    });

    it('getTransactionOptions method should add "View receipt" option to the transaction options if the transaction has recieptUrl', () => {
        const options = (component as any).getTransactionOptions({ ...MockTransactionsService.MOCK_TRANSACTION, recieptUrl: 'some-url' });

        expect(options).toContain('View receipt');
    });

    it('getTransactionOptions method should add "Download invoice" option to the transaction options if the transaction has invoiceUrl', () => {
        const options = (component as any).getTransactionOptions({ ...MockTransactionsService.MOCK_TRANSACTION, invoiceUrl: 'some-url' });

        expect(options).toContain('Download invoice');
    });

    it('getTransactionOptions method should return empty array if the transaction has neither recieptUrl nor invoiceUrl', () => {
        const options = (component as any).getTransactionOptions({
            ...MockTransactionsService.MOCK_TRANSACTION,
            invoiceUrl: null,
            recieptUrl: null,
        });

        expect(options.length).toBe(0);
    });

    it('should complete loader and set transactionsLoaded=true when transactionsService.getTransactionsList method emits a transactions', fakeAsync(() => {
        jest.spyOn((component as any).loader, 'complete');
        component.transactionsLoaded = false;

        (component as any).getTransactionsList();
        tick();

        expect(component.transactionsLoaded).toBeTruthy();
        expect((component as any).loader.complete).toHaveBeenCalled();
    }));

    it('should complete loader when transactionsService.getTransactionsList throws error', () => {
        jest.spyOn((component as any).loader, 'complete');
        (component as any).transactionsService.getTransactionsList = () => throwError('Error');

        try {
            (component as any).getTransactionsList();
            tick();
        } catch {}

        expect((component as any).loader.complete).toHaveBeenCalled();
    });

    it('should set correct transactionsListing.data property when transactionsService.getTransactionsList method emits a transactions', fakeAsync(() => {
        component.transactionsListing.data = { count: 0, list: [], pageNumber: 0, pages: 0 };

        const mockTransaction = { ...MockTransactionsService.MOCK_TRANSACTION };
        const mockTransactionListResponse = { ...MockTransactionsService.MOCK_TRANSACTIONS_LIST, list: { ...mockTransaction } };
        const mockOptions = ['View receipt'];
        const mockStatus = 'Successful';
        const mockTransactionWithAppInfo = { ...mockTransaction, appName: 'App name', appIcon: 'app-icon' };
        const mockFullTransaction = { ...mockTransactionWithAppInfo, options: mockOptions, status: mockStatus };

        (component as any).transactionsService.getTransactionsList = () => of(mockTransactionListResponse);
        (component as any).getTransactionsWithAppInfo = () => of([mockTransactionWithAppInfo]);
        (component as any).getTransactionOptions = () => mockOptions;
        (component as any).getTransactionStatus = () => mockStatus;

        (component as any).getTransactionsList();
        tick();

        expect(component.transactionsListing.data).toEqual({ ...mockTransactionListResponse, list: [{ ...mockFullTransaction }] });
    }));

    it('should keep previous page when getTransactionsList method is called with startNewPagination=false', fakeAsync(() => {
        component.transactionsListing.data = { count: 0, list: [], pageNumber: 0, pages: 0 };

        (component as any).getTransactionsList();
        tick();

        (component as any).getTransactionsList();
        tick();

        expect(component.transactionsListing.data.list.length).toBe(MockTransactionsService.MOCK_TRANSACTIONS_LIST.list.length * 2);
    }));

    it('handlePageScrolled method should increase page number and call getTransactionsList method', () => {
        jest.spyOn(component as any, 'getTransactionsList');
        (component as any).page = 1;

        component.handlePageScrolled();

        expect((component as any).page).toBe(2);
        expect((component as any).getTransactionsList).toHaveBeenCalled();
    });

    it('changeSortByKey method should change direction of the sort state with the corresponding key', () => {
        component.sortState.date = -1;

        component.changeSortByKey('date');

        expect(component.sortState.date).toBe(1);
    });

    it('changeSortByKey method should reset pages and call getTransactionsList with startNewPagination=true parameter', () => {
        jest.spyOn(component as any, 'getTransactionsList');
        (component as any).page = 10;

        component.changeSortByKey('date');

        expect((component as any).page).toBe(1);
        expect((component as any).getTransactionsList).toHaveBeenCalledWith(true);
    });

    it('handleOptionClick method should open the new window with invoiceUrl when option is "Download invoice"', () => {
        const invoiceUrl = 'invoice-url';
        window.open = jest.fn();

        component.handleOptionClick('Download invoice', { invoiceUrl } as Transaction);

        expect(window.open).toHaveBeenCalledWith(invoiceUrl);
    });

    it('handleOptionClick method should open the new window with recieptUrl when option is "View receipt"', () => {
        const recieptUrl = 'receipt-url';
        window.open = jest.fn();

        component.handleOptionClick('View receipt', { recieptUrl } as Transaction);

        expect(window.open).toHaveBeenCalledWith(recieptUrl);
    });

    it('should render table only when transactions loaded', () => {
        component.transactionsLoaded = false;
        fixture.detectChanges();
        expect(getTableDE()).toBeNull();

        component.transactionsLoaded = true;
        fixture.detectChanges();
        expect(getTableDE()).not.toBeNull();
    });

    it('should call handlePageScrolled when table emits pageScrolled', () => {
        jest.spyOn(component, 'handlePageScrolled');

        component.transactionsLoaded = true;
        fixture.detectChanges();

        getTableDE().triggerEventHandler('pageScrolled', {});
        expect(component.handlePageScrolled).toHaveBeenCalled();
    });

    it('should pass correct modifyColumns to the table', () => {
        const columns = ['app-name', 'date', 'amount', 'status', 'app-options'];

        component.transactionsLoaded = true;
        fixture.detectChanges();

        const tableInstance = getTableDE().componentInstance;

        columns.forEach(column => {
            expect(tableInstance.modifyColumns[column].headerCellTemplate).not.toBeNull();
            expect(tableInstance.modifyColumns[column].rowCellTemplate).not.toBeNull();
        });
    });

    it('should pass properties and active columns to the table', () => {
        component.transactionsLoaded = true;
        fixture.detectChanges();

        const tableInstance = getTableDE().componentInstance;

        expect(tableInstance.properties).toEqual(component.transactionsListing);
        expect(tableInstance.activeColumns).toEqual(component.activeColumns);
    });
});
