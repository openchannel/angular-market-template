import { Component, OnInit } from '@angular/core';
import { StripeElements } from '@stripe/stripe-js';
import { StripeLoaderService } from '@core/services/stripe-loader.service';

@Component({
    selector: 'app-billing',
    templateUrl: './billing.component.html',
    styleUrls: ['./billing.component.scss'],
})
export class BillingComponent implements OnInit {
    elements: StripeElements;

    constructor(private stripeLoader: StripeLoaderService) {}

    ngOnInit(): void {
        this.elements = this.stripeLoader.stripe.elements();
        console.log(this.elements);
    }
}
