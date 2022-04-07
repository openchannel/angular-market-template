import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppDetailComponent } from './app-detail.component';
import {
    MockAppsService,
    MockAppVersionService,
    MockAuthHolderService,
    MockButtonActionComponent,
    MockButtonActionService,
    MockButtonComponent,
    MockDropdownComponent,
    MockFrontendService,
    MockLoadingBarService,
    MockMarketMetaTagService,
    MockOcAppDescriptionComponent,
    MockOcImageGalleryComponent,
    MockOcOverallRatingComponent,
    MockOcRatingComponent,
    MockOcRecomendedAppsComponent,
    MockOcReviewComponent,
    MockOcReviewListComponent,
    MockOcVideoComponent,
    MockRoutingComponent,
    MockSiteContentService,
    MockStatisticService,
    MockTitleService,
} from '../../../../mock/mock';
import {
    AppsService,
    AppVersionService,
    AuthHolderService,
    FrontendService,
    SiteContentService,
    StatisticService,
    TitleService,
} from '@openchannel/angular-common-services';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { MarketMetaTagService } from '@core/services/meta-tag-service/meta-tag-service.service';
import { ButtonActionService } from '@features/button-action/button-action.service';
import { RouterTestingModule } from '@angular/router/testing';

describe.skip('AppDetailComponent', () => {
    let component: AppDetailComponent;
    let fixture: ComponentFixture<AppDetailComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    AppDetailComponent,
                    MockButtonComponent,
                    MockOcRatingComponent,
                    MockButtonActionComponent,
                    MockOcVideoComponent,
                    MockOcImageGalleryComponent,
                    MockOcAppDescriptionComponent,
                    MockOcOverallRatingComponent,
                    MockOcReviewListComponent,
                    MockOcReviewComponent,
                    MockDropdownComponent,
                    MockOcRecomendedAppsComponent,
                ],
                providers: [
                    { provide: AppsService, useClass: MockAppsService },
                    { provide: AppVersionService, useClass: MockAppVersionService },
                    { provide: FrontendService, useClass: MockFrontendService },
                    { provide: LoadingBarService, useClass: MockLoadingBarService },
                    { provide: TitleService, useClass: MockTitleService },
                    { provide: StatisticService, useClass: MockStatisticService },
                    { provide: MarketMetaTagService, useClass: MockMarketMetaTagService },
                    { provide: SiteContentService, useClass: MockSiteContentService },
                    { provide: AuthHolderService, useClass: MockAuthHolderService },
                    { provide: ButtonActionService, useClass: MockButtonActionService },
                ],
                imports: [
                    RouterTestingModule.withRoutes([
                        { component: MockRoutingComponent, path: 'browse' },
                        { component: MockRoutingComponent, path: 'not-found' },
                    ]),
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(AppDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
