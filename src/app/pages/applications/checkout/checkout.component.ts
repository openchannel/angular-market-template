import { Component, OnInit } from '@angular/core';
import { StripeLoaderService } from '@core/services/stripe-loader.service';
import { AppsService, AppVersionService } from '@openchannel/angular-common-services';
import { ActivatedRoute } from '@angular/router';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { FullAppData } from '@openchannel/angular-common-components';
import { pageConfig } from 'assets/data/configData';

@Component({
    selector: 'app-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
    app: FullAppData;
    isTerms = false;
    termsUrl = 'https://my.openchannel.io/terms-of-service';
    policyUrl = 'https://my.openchannel.io/data-processing-policy';
    validateCheckbox = false;

    private loader: LoadingBarState;
    private $destroy: Subject<void> = new Subject<void>();

    constructor(
        private stripeLoader: StripeLoaderService,
        private appService: AppsService,
        private activeRoute: ActivatedRoute,
        private loadingBar: LoadingBarService,
        private appVersionService: AppVersionService,
    ) {}

    ngOnInit(): void {
        this.loader = this.loadingBar.useRef();

        this.stripeLoader.loadStripe();
        this.loadAppData();
    }
    goBack(): void {
        history.back();
    }

    private loadAppData(): void {
        this.loader.start();

        const appId = this.activeRoute.snapshot.paramMap.get('appId');
        const appVersion = this.activeRoute.snapshot.paramMap.get('appVersion');
        const safeName = this.activeRoute.snapshot.paramMap.get('safeName');

        const appRequest = safeName
            ? this.appService.getAppBySafeName(safeName)
            : this.appVersionService.getAppByVersion(appId, Number(appVersion));

        appRequest
            .pipe(
                takeUntil(this.$destroy),
                map(app => {
                    const mappedApp = new FullAppData(app, pageConfig.fieldMappings);
                    if (typeof mappedApp.images[0] === 'string') {
                        mappedApp.images = (mappedApp.images as string[]).map(imageItem => {
                            return {
                                image: imageItem,
                            };
                        });
                    }
                    return mappedApp;
                }),
            )
            .subscribe(
                app => {
                    this.app = app;
                    this.loader.complete();
                },
                () => this.loader.complete(),
            );
    }
}
