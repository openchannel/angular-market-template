import { Component, OnInit } from '@angular/core';
import { StripeLoaderService } from '@core/services/stripe-loader.service';
import {
    AppsService,
    AppVersionService,
    CreditCard,
    PaymentTaxesResponse,
    Purchase,
    StripeService,
    UserAccount,
    UserAccountService,
} from '@openchannel/angular-common-services';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { FullAppData } from '@openchannel/angular-common-components';
import { pageConfig } from 'assets/data/configData';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
    app: FullAppData;
    card: CreditCard;
    paymentAndTaxes: PaymentTaxesResponse;
    termsUrl = 'https://my.openchannel.io/terms-of-service';
    policyUrl = 'https://my.openchannel.io/data-processing-policy';
    user: UserAccount;

    isTerms = false;
    validateCheckbox = false;
    purchaseSuccessful = false;
    purchaseProcess = false;

    private loader: LoadingBarState;
    private $destroy: Subject<void> = new Subject<void>();

    constructor(
        private stripeLoader: StripeLoaderService,
        private appService: AppsService,
        private activeRoute: ActivatedRoute,
        private loadingBar: LoadingBarService,
        private appVersionService: AppVersionService,
        private router: Router,
        private stripeService: StripeService,
        private accountService: UserAccountService,
        private toaster: ToastrService,
    ) {}

    ngOnInit(): void {
        this.loader = this.loadingBar.useRef();

        this.stripeLoader.loadStripe();
        this.loadAppData();
        this.loadCurrentUserDetails();
    }

    get currencySymbol(): string {
        const isoCurrencyCode = {
            USD: '$',
            EUR: '€',
            CNY: '¥',
            GBP: '£',
        };

        return isoCurrencyCode[this.app?.model[0].currency] || isoCurrencyCode[0];
    }

    goBack(): void {
        history.back();
    }

    onSuccessButtonPressed(): void {
        this.validateCheckbox = !this.isTerms;
    }

    onCardDataLoaded(cardData: CreditCard): void {
        if (!this.card || cardData.address_state !== this.card.address_state) {
            console.log(cardData);
            this.loader.start();
            this.stripeService
                .getTaxesAndPayment(cardData.address_country, cardData.address_state, this.app.appId, this.app.model[0].modelId)
                .pipe(takeUntil(this.$destroy))
                .subscribe(
                    taxesResponse => {
                        this.paymentAndTaxes = taxesResponse;
                        this.loader.complete();
                    },
                    () => this.loader.complete(),
                );
        }
        this.card = cardData;
    }

    getSubtotal(): string {
        let subtotal = this.currencySymbol + this.app?.model[0].price;
        if (this.paymentAndTaxes && this.paymentAndTaxes.subtotal) {
            subtotal = this.currencySymbol + this.paymentAndTaxes.subtotal;
        }
        return subtotal;
    }

    navigateToMarketplace(): void {
        this.router.navigate(['/']).then();
    }

    onSuccessAction(): void {
        this.purchaseProcess = true;
        const purchase: Purchase = {
            models: [
                {
                    appId: this.app.appId,
                    modelId: this.app.model[0].modelId,
                },
            ],
        };
        this.stripeService
            .makePurchase(purchase)
            .pipe(takeUntil(this.$destroy))
            .subscribe(
                () => {
                    this.purchaseSuccessful = true;
                    this.purchaseProcess = false;
                },
                error => {
                    this.toaster.error(error.message);
                    this.purchaseProcess = false;
                },
            );
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

    private loadCurrentUserDetails(): void {
        this.loader.start();
        this.accountService
            .getUserAccount()
            .pipe(takeUntil(this.$destroy))
            .subscribe(
                userResponse => {
                    this.user = userResponse;
                    this.loader.complete();
                },
                () => this.loader.complete(),
            );
    }
}
