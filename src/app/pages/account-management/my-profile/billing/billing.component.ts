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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OcConfirmationModalComponent } from '@openchannel/angular-common-components';

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
            changeStatus: {
                elementType: 'cardNumber',
                brand: 'unknown',
                empty: true,
                complete: false,
                error: undefined,
            },
        },
        cardExpiration: {
            element: null,
            changeStatus: {
                elementType: 'cardExpiry',
                empty: true,
                complete: false,
                error: undefined,
            },
        },
        cardCvc: {
            element: null,
            changeStatus: {
                elementType: 'cardCvc',
                empty: true,
                complete: false,
                error: undefined,
            },
        },
    };
    // status of loading stripe elements
    stripeLoaded = false;
    // switcher between stripe and demo elements. If true - demo elements will be showed
    hideCardFormElements = false;
    isSaveInProcess = false;
    // saved card data
    cardData: CreditCard = null;

    formBillingAddress = new FormGroup({
        name: new FormControl('', Validators.required),
        address_line1: new FormControl('', Validators.required),
        address_line2: new FormControl(''),
        address_country: new FormControl('', Validators.required),
        address_state: new FormControl('', Validators.required),
        address_city: new FormControl('', Validators.required),
        address_zip: new FormControl('', [Validators.required, Validators.maxLength(5)]),
    });

    process = false;
    billingCountries: any[] = [];
    billingStates: string[] = [];

    private $destroy: Subject<void> = new Subject<void>();
    private elements: StripeElements;
    private stripe: Stripe;

    constructor(
        private stripeLoader: StripeLoaderService,
        private stripeService: StripeService,
        private toaster: ToastrService,
        private countryStateService: CountryStateService,
        private modal: NgbModal,
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
            // updating the billing address information
            if (this.hideCardFormElements && this.formBillingAddress.valid && !this.process) {
                this.updateBillingData();
            } else if (!this.hideCardFormElements) {
                this.removeOrDeleteCard();
            }
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
            address_state: '',
        });
        this.billingStates = [];
        this.process = true;
        this.countryStateService.getStates(country).subscribe(
            (response: any) => {
                response.data.states.forEach(state => {
                    this.billingStates.push(state.name);
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
            ...this.formBillingAddress.getRawValue(),
            address_country: this.formBillingAddress.controls.address_country.value.iso,
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
            ...this.cardData,
            address_country: this.billingCountries.find(country => country.iso === this.cardData.address_country),
        });
        this.cardForm.cardNumber.changeStatus = {
            ...this.cardForm.cardNumber.changeStatus,
            complete: false,
            error: undefined,
            empty: true,
        };
        this.cardForm.cardCvc.changeStatus = {
            ...this.cardForm.cardCvc.changeStatus,
            complete: false,
            error: undefined,
            empty: true,
        };
        this.cardForm.cardExpiration.changeStatus = {
            ...this.cardForm.cardExpiration.changeStatus,
            complete: false,
            error: undefined,
            empty: true,
        };

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

    private updateBillingData(): void {
        const dataToServer = {
            ...this.formBillingAddress.getRawValue(),
            address_country: this.formBillingAddress.controls.address_country.value.iso,
        };
        this.process = true;
        this.stripeService
            .updateUserCreditCard(this.cardData.cardId, dataToServer)
            .pipe(takeUntil(this.$destroy))
            .subscribe(
                cardResponse => {
                    this.toaster.success('Your billing data has been updated');
                    this.cardData = cardResponse.cards[0];
                    this.process = false;
                },
                () => (this.process = false),
            );
    }

    private deleteCurrentCard(createNew?: boolean): void {
        this.process = true;
        this.stripeService
            .deleteUserCreditCard(this.cardData.cardId)
            .pipe(takeUntil(this.$destroy))
            .subscribe(
                () => {
                    this.toaster.success('Your card has been removed');
                    this.cardData = null;
                    this.process = false;
                    this.clearChanges();
                    if (createNew) {
                        this.createStripeCardWithToken();
                    }
                },
                () => (this.process = false),
            );
    }

    private removeOrDeleteCard(): void {
        // removing an old card and connecting new
        if (this.getFormsValidity()) {
            this.deleteCurrentCard(true);
        } else {
            // deleting a card with a confirmation modal
            const modalRef = this.modal.open(OcConfirmationModalComponent, { size: 'md' });

            modalRef.componentInstance.modalTitle = 'Delete card';
            modalRef.componentInstance.modalText = 'Are sure want to delete your card?';
            modalRef.componentInstance.confirmButtonText = 'Yes, delete it';
            modalRef.componentInstance.confirmButtonType = 'danger';

            modalRef.result.then(
                res => {
                    if (res) {
                        this.deleteCurrentCard();
                    } else {
                        this.clearChanges();
                    }
                },
                () => {},
            );
        }
    }
}
