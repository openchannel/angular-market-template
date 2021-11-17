import { Component, OnDestroy, OnInit } from '@angular/core';
import { Stripe, StripeCardCvcElement, StripeCardExpiryElement, StripeCardNumberElement, StripeElements } from '@stripe/stripe-js';
import { StripeLoaderService } from '@core/services/stripe-loader.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CreditCard, StripeService } from '@openchannel/angular-common-services';
import { ToastrService } from 'ngx-toastr';
import { StripeCardNumberElementChangeEvent } from '@stripe/stripe-js/types/stripe-js/elements/card-number';
import { StripeCardExpiryElementChangeEvent } from '@stripe/stripe-js/types/stripe-js/elements/card-expiry';
import { StripeCardCvcElementChangeEvent } from '@stripe/stripe-js/types/stripe-js/elements/card-cvc';

export interface StripeCardForm {
    cardHolder: string;
    cardNumber: {
        element: StripeCardNumberElement;
        changeStatus: StripeCardNumberElementChangeEvent;
    };
    cardExpiration: {
        element: StripeCardExpiryElement;
        changeStatus: StripeCardExpiryElementChangeEvent;
    };
    cardCvc: {
        element: StripeCardCvcElement;
        changeStatus: StripeCardCvcElementChangeEvent;
    };
}
@Component({
    selector: 'app-billing',
    templateUrl: './billing.component.html',
    styleUrls: ['./billing.component.scss'],
})
export class BillingComponent implements OnInit, OnDestroy {
    cardForm: StripeCardForm = {
        cardHolder: '',
        cardNumber: {
            element: null,
            changeStatus: null,
        },
        cardExpiration: {
            element: null,
            changeStatus: null,
        },
        cardCvc: {
            element: null,
            changeStatus: null,
        },
    };
    stripeLoaded = false;
    cardData: CreditCard;

    hideCardFormElements = false;

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

    /**
     * Making actions according to the card data. There are adding new card, update data or delete card
     */
    billingAction(): void {
        if (this.cardData) {
            // update card data or delete card
        } else {
            this.saveBillingData();
        }
    }

    onCountriesChange(country: string): void {}

    /**
     * Actions on "Cancel" button click
     */
    clearChanges(): void {
        if (this.cardData) {
            this.fillCardForm();
        } else {
            this.formBillingAddress.reset();
            this.cardForm.cardNumber.element.clear();
            this.cardForm.cardCvc.element.clear();
            this.cardForm.cardExpiration.element.clear();
            this.cardForm.cardHolder = '';
        }
    }

    /**
     * Saving full card data with address form
     * @private
     */
    private saveBillingData(): void {
        this.formBillingAddress.markAllAsTouched();
        this.cardForm.cardNumber.element.blur();
        if (this.formBillingAddress.valid && !this.isSaveInProcess) {
            this.createStripeCardWithToken();
        }
    }

    /**
     * Creation and mounting the stripe elements for card
     * @private
     */
    private createStripeBillingElements(): void {
        this.cardForm.cardNumber.element = this.elements.create('cardNumber');
        this.cardForm.cardExpiration.element = this.elements.create('cardExpiry');
        this.cardForm.cardCvc.element = this.elements.create('cardCvc');
        this.cardForm.cardNumber.element.mount('#card-element');
        this.cardForm.cardExpiration.element.mount('#expiration-element');
        this.cardForm.cardCvc.element.mount('#cvc-element');

        this.stripeLoaded = true;
    }

    private createStripeCardWithToken(): void {
        this.isSaveInProcess = true;
        const dataToStripe = {
            name: this.cardForm.cardHolder,
            address_country: this.formBillingAddress.get('billingCountry').value,
            address_zip: this.formBillingAddress.get('billingPostCode').value,
            address_state: this.formBillingAddress.get('billingState').value,
            address_city: this.formBillingAddress.get('billingCity').value,
            address_line1: this.formBillingAddress.get('billingAddress1').value,
            billingAddress2: this.formBillingAddress.get('billingAddress2').value,
        };
        this.stripe.createToken(this.cardForm.cardNumber.element, dataToStripe).then(resp => {
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
                this.fillCardForm();
            });
    }

    private fillCardForm(): void {
        this.cardForm.cardHolder = this.cardData.name;
        this.formBillingAddress.patchValue({
            billingName: this.cardData.name,
            billingAddress1: this.cardData.address_line1,
            billingAddress2: this.cardData.address_line2,
            billingCountry: this.cardData.address_country,
            billingState: this.cardData.address_state,
            billingCity: this.cardData.address_city,
            billingPostCode: this.cardData.address_zip,
        });
        this.hideCardFormElements = this.stripeLoaded && !!this.cardData.cardId;
    }
}
