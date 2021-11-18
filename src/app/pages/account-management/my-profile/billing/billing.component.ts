import { Component, OnDestroy, OnInit } from '@angular/core';
import { Stripe, StripeCardCvcElement, StripeCardExpiryElement, StripeCardNumberElement, StripeElements } from '@stripe/stripe-js';
import { StripeLoaderService } from '@core/services/stripe-loader.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CreditCard, StripeService, CountryStateService } from '@openchannel/angular-common-services';
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
    // form for card with stripe elements and elements status
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
    // status of loading stripe elements
    stripeLoaded = false;
    // switcher between stripe and demo elements
    hideCardFormElements = false;
    isSaveInProcess = false;
    // saved card data
    cardData: CreditCard;

    formBillingAddress = new FormGroup({
        billingName: new FormControl('', Validators.required),
        billingAddress1: new FormControl('', Validators.required),
        billingAddress2: new FormControl(''),
        billingCountry: new FormControl('', Validators.required),
        billingState: new FormControl('', Validators.required),
        billingCity: new FormControl('', Validators.required),
        billingPostCode: new FormControl('', Validators.required),
    });

    process = false;
    billingCountries: any[] = [];
    billingStates: any[] = [];

    private $destroy: Subject<void> = new Subject<void>();
    private elements: StripeElements;
    private stripe: Stripe;

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
            this.getCountries();
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
            // creating token and saving card
            if (this.getFormsValidity()) {
                this.createStripeCardWithToken();
            }
        }
    }

    /**
     * Gets countries list from opensource api.
     * Creates an array of objects with countries names and iso2 codes.
     */
    getCountries(): void {
        this.billingCountries = [];
        this.process = true;
        this.countryStateService.getCountries().subscribe(
            (countries: any) => {
                countries.data.forEach(country => {
                    this.billingCountries.push({
                        iso: country.Iso2,
                        name: country.name,
                    });
                });
                this.process = false;
            },
            () => {
                this.process = false;
                this.billingCountries = [];
            },
        );
    }

    /**
     * Gets currentCountry on country change.
     */
    onCountriesChange(country: any): void {
        const currentCountry = {
            country: country.name,
        };
        this.getStates(currentCountry);
    }

    /**
     * Gets states list of current country.
     */
    getStates(country: any): void {
        this.formBillingAddress.patchValue({
            billingState: '',
        });
        this.billingStates = [];
        this.process = true;
        this.countryStateService.getStates(country).subscribe(
            (response: any) => {
                response.data.states.forEach(state => {
                    this.billingStates.push({
                        country: response.data.name,
                        name: state.name,
                    });
                });
                this.process = false;
            },
            () => {
                this.billingStates = [];
                this.process = false;
            },
        );
    }

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
        this.listenToStripeFormChanges();
    }

    private createStripeCardWithToken(): void {
        this.process = true;
        const dataToStripe = {
            name: this.cardForm.cardHolder,
            address_country: this.formBillingAddress.get('billingCountry').value.iso,
            address_zip: this.formBillingAddress.get('billingPostCode').value,
            address_state: this.formBillingAddress.get('billingState').value.name,
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
                this.cardData = cardResponse.cards[0];
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
        this.cardForm.cardNumber.changeStatus = null;
        this.cardForm.cardCvc.changeStatus = null;
        this.cardForm.cardExpiration.changeStatus = null;

        this.hideCardFormElements = this.stripeLoaded && !!this.cardData.cardId;
    }

    private listenToStripeFormChanges(): void {
        this.cardForm.cardNumber.element.on('change', event => {
            this.cardForm.cardNumber.changeStatus = event;
        });
        this.cardForm.cardCvc.element.on('change', event => {
            this.cardForm.cardCvc.changeStatus = event;
        });
        this.cardForm.cardExpiration.element.on('change', event => {
            this.cardForm.cardExpiration.changeStatus = event;
        });
    }

    private getFormsValidity(): boolean {
        this.formBillingAddress.markAllAsTouched();
        const numberValidity = this.cardForm.cardNumber.changeStatus.complete && !this.cardForm.cardNumber.changeStatus.error;
        const cvcValidity = this.cardForm.cardCvc.changeStatus.complete && !this.cardForm.cardCvc.changeStatus.error;
        const expirationValidity = this.cardForm.cardExpiration.changeStatus.complete && !this.cardForm.cardExpiration.changeStatus.error;

        return this.formBillingAddress.valid && !this.process && numberValidity && cvcValidity && expirationValidity;
    }
}
