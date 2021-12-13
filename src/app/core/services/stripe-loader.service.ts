import { Injectable } from '@angular/core';
import { GetMarketplaceStripeSettingsResponse, StripeService } from '@openchannel/angular-common-services';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { from, Observable } from 'rxjs';
import { mergeMap, shareReplay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class StripeLoaderService {
    private stripeCache$: Observable<Stripe>;

    constructor(private stripeService: StripeService) {}
    loadStripe(): Observable<Stripe> {
        if (!this.stripeCache$) {
            this.stripeCache$ = this.stripeService.getMarketplaceStripeSettings().pipe(
                mergeMap((settings: GetMarketplaceStripeSettingsResponse) => from(loadStripe(settings.publishableKey))),
                shareReplay(1),
            );
        }
        return this.stripeCache$;
    }
}
