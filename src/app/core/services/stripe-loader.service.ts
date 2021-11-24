import { Injectable } from '@angular/core';
import { GetMarketplaceStripeSettingsResponse, StripeService } from '@openchannel/angular-common-services';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Subject, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class StripeLoaderService {
    stripe: Subject<Stripe> = new Subject<Stripe>();

    constructor(private stripeService: StripeService) {}
    loadStripe(): void {
        this.stripeService
            .getMarketplaceStripeSettings()
            .pipe(mergeMap((settings: GetMarketplaceStripeSettingsResponse) => from(loadStripe(settings.publishableKey))))
            .subscribe(stripe => {
                this.stripe.next(stripe);
            });
    }
}
