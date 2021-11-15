import { Component, OnDestroy, OnInit } from '@angular/core';
import { StripeElements } from '@stripe/stripe-js';
import { StripeLoaderService } from '@core/services/stripe-loader.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    }
}
