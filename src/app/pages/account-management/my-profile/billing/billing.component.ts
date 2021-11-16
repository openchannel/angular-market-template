import { Component, OnDestroy, OnInit } from '@angular/core';
import { StripeCardCvcElement, StripeCardExpiryElement, StripeCardNumberElement, StripeElements } from '@stripe/stripe-js';
import { StripeLoaderService } from '@core/services/stripe-loader.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

    formBillingAddress = new FormGroup({
        billingName: new FormControl('', Validators.required),
        billingEmail: new FormControl('', [Validators.required, Validators.email]),
        billingAddress1: new FormControl('', Validators.required),
        billingAddress2: new FormControl(''),
        billingCountry: new FormControl('', Validators.required),
        billingState: new FormControl('', Validators.required),
        billingCity: new FormControl('', Validators.required),
        billingPostCode: new FormControl('', Validators.required),
    });

    isSaveInProcess = false;
    billingCountries = ['USA', 'UKRAINE', 'CANADA'];
    billingStates = ['State1', 'State2', 'State3'];

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

    saveBillingData(): void {
        this.formBillingAddress.markAllAsTouched();
        if (this.formBillingAddress.valid && !this.isSaveInProcess) {
            console.log(this.formBillingAddress.getRawValue());
        }
    }

    onCountriesChange(country: string): void {}

    private createStripeBillingElements(): void {
        this.paymentForm = {
            ...this.paymentForm,
            cardNumber: this.elements.create('cardNumber').mount('#card-element'),
            cardExpiration: this.elements.create('cardExpiry').mount('#expiration-element'),
            cardCvc: this.elements.create('cardCvc').mount('#cvc-element'),
        };
        this.stripeLoaded = true;
    }

    // setBillingFormGroup(passwordGroup: FormGroup): void {
    //     this.billingFormGroup = passwordGroup;
    //     this.billingFormGroup.controls.password.clearValidators();
    //     this.billingFormGroup.controls.password.setValidators(Validators.required);
    //     this.billingFormGroup.controls.password.updateValueAndValidity();
    // }
}
