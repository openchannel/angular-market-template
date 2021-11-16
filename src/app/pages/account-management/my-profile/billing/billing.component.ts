import { Component, OnDestroy, OnInit } from '@angular/core';
import { Stripe, StripeCardCvcElement, StripeCardExpiryElement, StripeCardNumberElement, StripeElements } from '@stripe/stripe-js';
import { StripeLoaderService } from '@core/services/stripe-loader.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CreditCard, StripeService } from '@openchannel/angular-common-services';
import { ToastrService } from 'ngx-toastr';

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
    paymentForm: StripeCardForm = {
        cardHolder: '',
        cardNumber: null,
        cardExpiration: null,
        cardCvc: null,
    };
    stripeLoaded = false;
    cardData: CreditCard;

    private elements: StripeElements;
    private stripe: Stripe;

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

    constructor(private stripeLoader: StripeLoaderService, private stripeService: StripeService, private toaster: ToastrService) {}

    ngOnInit(): void {
        this.stripeLoader.stripe.pipe(takeUntil(this.$destroy)).subscribe(stripe => {
            this.elements = stripe.elements();
            this.stripe = stripe;
            this.createStripeBillingElements();
            this.getCard();
        });
    }

    ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

    billingAction(): void {
        if (this.cardData) {
            // update card data or delete card
        } else {
            this.saveBillingData();
        }
    }

    onCountriesChange(country: string): void {}

    private saveBillingData(): void {
        this.formBillingAddress.markAllAsTouched();
        if (this.formBillingAddress.valid && !this.isSaveInProcess) {
            this.createStripeCardWithToken();
        }
    }

    private createStripeBillingElements(): void {
        this.paymentForm = {
            ...this.paymentForm,
            cardNumber: this.elements.create('cardNumber'),
            cardExpiration: this.elements.create('cardExpiry'),
            cardCvc: this.elements.create('cardCvc'),
        };
        this.paymentForm.cardNumber.mount('#card-element');
        this.paymentForm.cardExpiration.mount('#expiration-element');
        this.paymentForm.cardCvc.mount('#cvc-element');

        this.stripeLoaded = true;
    }

    private createStripeCardWithToken(): void {
        this.isSaveInProcess = true;
        const dataToStripe = {
            name: this.paymentForm.cardHolder,
            address_country: this.formBillingAddress.get('billingCountry').value,
            address_zip: this.formBillingAddress.get('billingPostCode').value,
            address_state: this.formBillingAddress.get('billingState').value,
            address_city: this.formBillingAddress.get('billingCity').value,
            address_line1: this.formBillingAddress.get('billingAddress1').value,
            billingAddress2: this.formBillingAddress.get('billingAddress2').value,
        };
        this.stripe.createToken(this.paymentForm.cardNumber, dataToStripe).then(resp => {
            this.stripeService
                .addUserCreditCard(resp.token.id)
                .pipe(takeUntil(this.$destroy))
                .subscribe(
                    () => {
                        this.toaster.success('Card has been added');
                        this.isSaveInProcess = false;
                    },
                    () => (this.isSaveInProcess = false),
                );
        });
    }

    private getCard(): void {
        this.stripeService
            .getUserCreditCards()
            .pipe(takeUntil(this.$destroy))
            .subscribe(cardResponse => {
                this.cardData = cardResponse.cards.length > 0 ? cardResponse.cards[0] : null;
                console.log(this.cardData);
            });
    }
}
