import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    StripeCardCvcElement,
    StripeCardExpiryElement,
    StripeCardNumberElement,
    StripeElements
} from '@stripe/stripe-js';
import { StripeLoaderService } from '@core/services/stripe-loader.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface StripeCardForm {
    cardHolder: string;
    cardNumber: StripeCardNumberElement;
    cardExpiration: StripeCardExpiryElement;
    cardCvc: StripeCardCvcElement;
}
@Component({
    selector: 'app-billing',
    templateUrl: './billing.component.html',
    styleUrls: ['./billing.component.scss'],
})
export class BillingComponent implements OnInit, OnDestroy {
    paymentForm = {
        cardHolder: '',
        cardNumber: null,
        cardExpiration: null,
        cardCvc: null,
    };
    stripeLoaded = false;

    private elements: StripeElements;
    private $destroy: Subject<void> = new Subject<void>();

    constructor(private stripeLoader: StripeLoaderService) {}

    ngOnInit(): void {
        this.stripeLoader.stripe.pipe(takeUntil(this.$destroy)).subscribe(stripe => {
            this.elements = stripe.elements();
            this.createStripeBillingElements();
        });
    }

    ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

    private createStripeBillingElements(): void {
        this.paymentForm = {
            ...this.paymentForm,
            cardNumber: this.elements.create('cardNumber').mount('#card-element'),
            cardExpiration: this.elements.create('cardExpiry').mount('#expiration-element'),
            cardCvc: this.elements.create('cardCvc').mount('#cvc-element'),
        };
        this.stripeLoaded = true;
    }
}
