import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { AppSearchComponent } from './app-search.component';
import {
    MockCollapseWithTitleComponent,
    MockOcAppListGridComponent,
    MockSidebarComponent,
    MockTextSearchComponent,
} from '../../../../mock/components.mock';
import { mockAppsService, mockFrontendService, mockLoadingBarService, mockTitleService } from '../../../../mock/providers.mock';
import { RouterTestingModule } from '@angular/router/testing';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { throwError } from 'rxjs';
import { MockFrontendService } from '../../../../mock/services.mock';
import { AppsService } from '@openchannel/angular-common-services';

describe('AppSearchComponent', () => {
    let component: AppSearchComponent;
    let fixture: ComponentFixture<AppSearchComponent>;
    let router: Router;
    let location: Location;

    const mockOcAppListGridDE = () => fixture.debugElement.query(By.directive(MockOcAppListGridComponent));
    const mockOcSidebarDE = () => fixture.debugElement.query(By.directive(MockSidebarComponent));
    const mockOcTextSearchDE = () => fixture.debugElement.query(By.directive(MockTextSearchComponent));
    const mockAppCollapseWithTitleDE = () => fixture.debugElement.query(By.directive(MockCollapseWithTitleComponent));

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    AppSearchComponent,
                    MockCollapseWithTitleComponent,
                    MockOcAppListGridComponent,
                    MockSidebarComponent,
                    MockTextSearchComponent,
                ],
                imports: [RouterTestingModule, HttpClientTestingModule, NgbModule],
                providers: [mockAppsService(), mockFrontendService(), mockLoadingBarService(), mockTitleService()],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(AppSearchComponent);
        component = fixture.componentInstance;

        // Setup router for the component
        location = TestBed.inject(Location);
        router = TestBed.inject(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should inject all values and emit events in app-collapse-with-title', () => {
        fixture.detectChanges();

        const mockAppCollapseWithTitleComponent = mockAppCollapseWithTitleDE().componentInstance;

        jest.spyOn(component, 'onCollapseChanged');

        expect(mockAppCollapseWithTitleComponent.titleForClose).toBe('Close filter options');
        expect(mockAppCollapseWithTitleComponent.titleForOpen).toBe('Open filter options');
        expect(mockAppCollapseWithTitleComponent.collapsed).toBeTruthy();

        mockAppCollapseWithTitleComponent.collapseChanged.emit(false);

        expect(component.onCollapseChanged).toBeCalled();
        expect(component.isHideFilter).toBeFalsy();
    });

    it('should check .filter-container view with mocked data', fakeAsync(() => {
        const mockSidebarModel = {
            parent: { expanded: false, icon: '' },
        };
        const mockFilter = MockFrontendService.MOCK_FILTERS_PAGE;

        component.filters = mockFilter.list;

        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const filterContainer = fixture.debugElement.query(By.css('.filter-container'));
        const ocSidebar = mockOcSidebarDE();

        jest.spyOn(component, 'onSingleFilterChange');
        jest.spyOn(component, 'updateFilterValues');

        expect(filterContainer.nativeElement).not.toBeNull();
        expect(ocSidebar.componentInstance.title).toEqual(mockFilter.list[0].name);
        expect(ocSidebar.componentInstance.sidebarModel).toEqual(mockFilter.list[0].values);

        ocSidebar.componentInstance.sidebarChange.emit(mockSidebarModel);

        expect(component.onSingleFilterChange).toBeCalledWith(mockFilter.list[0], mockSidebarModel);
        expect(component.updateFilterValues).toBeCalledWith(true, mockFilter.list[0], mockSidebarModel);
    }));

    it('should check injected values and event emitters in oc-text-search', fakeAsync(() => {
        const activatedRoute = TestBed.inject(ActivatedRoute);

        jest.spyOn(activatedRoute.snapshot.queryParamMap, 'get').mockReturnValueOnce('mock');
        jest.spyOn(component, 'onTextChange');
        jest.spyOn(component, 'onSearchTagDeleted');
        jest.spyOn(component, 'getData');
        jest.spyOn(component, 'clearSearchText');
        jest.spyOn(component, 'disableFilterValue');
        jest.spyOn(component, 'clearAllSearchConditions');

        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const ocTextSearchComponent = mockOcTextSearchDE().componentInstance;

        expect(ocTextSearchComponent.searchText).toBe('mock');
        expect(ocTextSearchComponent.tagsTitles).toStrictEqual(['mock']);

        // check onTextChange() work enterSearch emit value

        ocTextSearchComponent.enterSearch.emit(' mock2 ');

        expect(component.onTextChange).toBeCalledWith(' mock2 ');
        expect(component.searchText).toBe('mock2');
        expect(component.getData).toBeCalled();

        fixture.detectChanges();

        expect(ocTextSearchComponent.searchText).toBe('mock2');
        expect(component.getData).toBeCalled();

        // check onSearchTagDeleted() work tagDeleted emit value

        ocTextSearchComponent.tagDeleted.emit(0);

        expect(component.onSearchTagDeleted).toBeCalledWith(0);
        expect(component.clearSearchText).toBeCalled();
        fixture.detectChanges();
        expect(component.searchText).toBe('');
        expect(component.onTextChange).toBeCalledWith('');

        // check clearAllSearchConditions() work allTagsDeleted emit value

        ocTextSearchComponent.allTagsDeleted.emit({});

        expect(component.clearAllSearchConditions).toBeCalled();
        expect(component.clearSearchText).toBeCalled();
    }));

    it('should check injected values in oc-app-list-grid', fakeAsync(() => {
        component.appPage = {
            pages: 0,
            count: 0,
            pageNumber: 0,
            list: [],
        };

        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const ocAppListGridComponent = mockOcAppListGridDE().componentInstance;

        expect(ocAppListGridComponent.appList).toStrictEqual([]);
        expect(ocAppListGridComponent.baseLinkForOneApp).toBe('/details');
        expect(ocAppListGridComponent.appNavigationParam).toBe('safeName[0]');
        expect(ocAppListGridComponent.defaultAppIcon).toBe('./assets/img/default-app-icon.svg');
    }));

    it('should check getData() method', fakeAsync(() => {
        fixture.detectChanges();

        jest.spyOn(component as any, 'updateCurrentUrlPath');
        jest.spyOn(component.loader, 'complete');
        jest.spyOn(component, 'searchAppObservable');
        jest.spyOn(component as any, 'getFilterQuery').mockReturnValueOnce('mock');

        component.searchText = 'test';
        component.getData();

        expect((component as any).updateCurrentUrlPath).toBeCalled();
        expect(component.searchAppObservable).toBeCalledWith('test', 'mock');

        tick();

        expect(component.loader.complete).toBeCalled();

        flush();

        // check error callback in searchAppObservable()

        jest.spyOn(component, 'searchAppObservable').mockReturnValueOnce(throwError('error'));

        component.getData();

        tick();

        expect(component.searchAppObservable).toBeCalled();
        expect(component.loader.complete).toBeCalled();

        flush();
    }));

    it('should check getSortedData() method work', fakeAsync(() => {
        const appService = TestBed.inject(AppsService);

        fixture.detectChanges();

        jest.spyOn(component as any, 'updateCurrentUrlPath');
        jest.spyOn(component, 'getData');
        jest.spyOn(component.loader, 'start');
        jest.spyOn(component.loader, 'complete');
        jest.spyOn(appService, 'getApps');

        component.getSortedData('collections', 'featured');

        // check flow when filter and sort !== undefined

        expect((component as any).updateCurrentUrlPath).toBeCalled();
        expect(component.loader.start).toBeCalled();
        expect(appService.getApps).toBeCalledWith(1, 100, '{randomize: 1}', '{"attributes.featured": "yes"}');

        tick();

        expect(component.loader.complete).toBeCalled();

        flush();

        // check error callback in appsService.getApps()

        jest.spyOn(appService, 'getApps').mockReturnValueOnce(throwError('error'));

        component.getSortedData('collections', 'featured');

        tick();

        expect(component.loader.complete).toBeCalled();

        // check flow when filter and sort === undefined

        component.getSortedData('', '');

        expect(component.getData).toBeCalled();
    }));

    it('should check disableFilterValue() method work', () => {
        const mockSelectedFilterValue = {
            id: '1',
            label: '',
            sort: '',
            query: '',
            description: '',
            expanded: false,
            checked: false,
            icon: '',
            values: [],
        };
        fixture.detectChanges();

        jest.spyOn(component, 'onSingleFilterChange');
        jest.spyOn(component, 'onMultiFilterChange');

        component.disableFilterValue({
            parentFilterId: 'collections',
            selectedFilterValue: mockSelectedFilterValue,
        });

        expect(component.onSingleFilterChange).toBeCalled();

        component.disableFilterValue({
            parentFilterId: '',
            selectedFilterValue: mockSelectedFilterValue,
        });

        expect(component.onMultiFilterChange).toBeCalled();
    });
});
