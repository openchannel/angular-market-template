import { Component, OnDestroy, OnInit } from '@angular/core';
import { Stripe, StripeCardCvcElement, StripeCardExpiryElement, StripeCardNumberElement, StripeElements } from '@stripe/stripe-js';
import { StripeLoaderService } from '@core/services/stripe-loader.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CreditCard, StripeService } from '@openchannel/angular-common-services';
import { ToastrService } from 'ngx-toastr';
import { CountryStateService } from '@openchannel/angular-common-services';

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
    cardForm: StripeCardForm = {
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

    process = false;
    billingCountries: any[] = [];
    billingStates = ['State1', 'State2', 'State3'];

    private $destroy: Subject<void> = new Subject<void>();

    constructor(
        private stripeLoader: StripeLoaderService,
        private stripeService: StripeService,
        private toaster: ToastrService,
        private countryStateService: CountryStateService,
    ) {}

    ngOnInit(): void {
        this.stripeLoader.stripe.pipe(takeUntil(this.$destroy)).subscribe(stripe => {
            this.elements = stripe.elements();
            this.stripe = stripe;
            this.createStripeBillingElements();
            this.getCard();
        });
        this.getCountries();
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
            this.cardForm.cardNumber.clear();
            this.cardForm.cardCvc.clear();
            this.cardForm.cardExpiration.clear();
            this.cardForm.cardHolder = '';
        }
    }

    getCountries(): void {
        this.process = true;
        this.countryStateService.getCountries().subscribe(
            (data: any) => {
                console.log(data);
                this.process = false;
                this.billingCountries = data;
            },
            () => {
                this.process = false;
                this.billingCountries = [];
            },
        );
    }
    
    /**
     * Saving full card data with address form
     * @private
     */
    private saveBillingData(): void {
        this.formBillingAddress.markAllAsTouched();
        this.cardForm.cardNumber.blur();
        if (this.formBillingAddress.valid && !this.process) {
            this.createStripeCardWithToken();
        }
    }

    /**
     * Creation and mounting the stripe elements for card
     * @private
     */
    private createStripeBillingElements(): void {
        this.cardForm = {
            ...this.cardForm,
            cardNumber: this.elements.create('cardNumber'),
            cardExpiration: this.elements.create('cardExpiry'),
            cardCvc: this.elements.create('cardCvc'),
        };
        this.cardForm.cardNumber.mount('#card-element');
        this.cardForm.cardExpiration.mount('#expiration-element');
        this.cardForm.cardCvc.mount('#cvc-element');

        this.stripeLoaded = true;
    }

    private createStripeCardWithToken(): void {
        this.process = true;
        const dataToStripe = {
            name: this.cardForm.cardHolder,
            address_country: this.formBillingAddress.get('billingCountry').value,
            address_zip: this.formBillingAddress.get('billingPostCode').value,
            address_state: this.formBillingAddress.get('billingState').value,
            address_city: this.formBillingAddress.get('billingCity').value,
            address_line1: this.formBillingAddress.get('billingAddress1').value,
            billingAddress2: this.formBillingAddress.get('billingAddress2').value,
        };
        this.stripe.createToken(this.cardForm.cardNumber, dataToStripe).then(resp => {
            this.stripeService
                .addUserCreditCard(resp.token.id)
                .pipe(takeUntil(this.$destroy))
                .subscribe(
                    () => {
                        this.toaster.success('Card has been added');
                        this.process = false;
                    },
                    () => (this.process = false),
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
    }
}
