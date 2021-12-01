import { Component, OnDestroy, OnInit } from '@angular/core';
import { Stripe, StripeCardCvcElement, StripeCardExpiryElement, StripeCardNumberElement, StripeElements } from '@stripe/stripe-js';
import { StripeLoaderService } from '@core/services/stripe-loader.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CreditCard, StripeService, CountryStateService, CountryModel, StatesModel } from '@openchannel/angular-common-services';
import { ToastrService } from 'ngx-toastr';
import { StripeCardNumberElementChangeEvent } from '@stripe/stripe-js/types/stripe-js/elements/card-number';
import { StripeCardExpiryElementChangeEvent } from '@stripe/stripe-js/types/stripe-js/elements/card-expiry';
import { StripeCardCvcElementChangeEvent } from '@stripe/stripe-js/types/stripe-js/elements/card-cvc';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OcConfirmationModalComponent } from '@openchannel/angular-common-components';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { HttpHeaders } from "@angular/common/http";

export interface StripeCardForm {
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
    billingCountries: CountryModel[] = [];
    billingStates: string[] = [];
    emptyStates: boolean = false;

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
        this.stripeLoader
            .loadStripe()
            .pipe(takeUntil(this.$destroy))
            .subscribe(stripe => {
                this.elements = stripe.elements();
                this.stripe = stripe;
                this.createStripeBillingElements();
                this.loadCountriesAndCardsInfo();
            });
    }

    ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

    /**
     * Gets countries list from opensource api.
     * Creates an array of objects with countries names and iso2 codes.
     */
    loadCountriesAndCardsInfo(): void {
        this.billingCountries = [];
        this.process = true;
        forkJoin({
            countries: this.countryStateService.getCountries(),
            cardsInfo: this.stripeService.getUserCreditCards(),
        }).subscribe(
            response => {
                this.billingCountries = response.countries.data;

                this.cardData = response.cardsInfo.cards[0];
                if (this.cardData) {
                    this.fillCardForm();
                }
            },
            () => {
                this.process = false;
            },
            () => {
                this.process = false;
            },
        );
    }

    /**
     * Making actions according to the card data. There are adding new card, update data or delete card
     */
    billingAction(): void {
        if (this.cardData) {
            // updating the billing address information
            this.formBillingAddress.markAllAsTouched();
            if (this.hideCardFormElements && this.formBillingAddress.valid && !this.process) {
                this.updateBillingData();
            } else if (!this.hideCardFormElements) {
                this.updateOrDeleteCard();
            }
        } else {
            // creating token and saving card
            if (this.getFormsValidity()) {
                this.createStripeCardWithToken();
            }
        }
    }

    /**
     * Gets currentCountry on country change.
     */
    onCountriesChange(country: CountryModel): void {
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
        this.countryStateService.getStates(country, new HttpHeaders({ 'x-handle-error': '404' })).subscribe(
            (response: StatesModel) => {
                this.billingStates = response.data.states.map(state => state.name);
                if (this.emptyStates && this.billingStates.length !== 0) {
                    this.formBillingAddress.get('address_state').enable();
                    this.formBillingAddress.get('address_state').setValidators(Validators.required);
                    this.formBillingAddress.get('address_state').updateValueAndValidity();
                    this.emptyStates = false;
                }
                this.process = false;
            },
            () => {
                if (!this.emptyStates && this.billingStates.length === 0) {
                    this.formBillingAddress.get('address_state').disable();
                    this.formBillingAddress.get('address_state').clearValidators();
                    this.formBillingAddress.get('address_state').updateValueAndValidity();
                    this.emptyStates = true;
                }
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
        }
    }

    showStripeForm(): void {
        this.hideCardFormElements = false;
        this.formBillingAddress.controls.name.setValue('');
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
            address_country: this.formBillingAddress.controls.address_country.value.Iso2,
        };
        this.stripe.createToken(this.cardForm.cardNumber.element, dataToStripe).then(resp => {
            this.stripeService
                .addUserCreditCard(resp.token.id)
                .pipe(takeUntil(this.$destroy))
                .subscribe(
                    cardResponse => {
                        this.toaster.success('Card has been added');
                        this.cardData = cardResponse.cards[0];
                        if (this.cardData) {
                            this.fillCardForm();
                        }
                    },
                    error => {
                        this.toaster.error(error.message);
                        this.process = false;
                    },
                );
        });
    }

    private fillCardForm(): void {
        this.formBillingAddress.patchValue({
            ...this.cardData,
            address_country: this.billingCountries.find(country => country.Iso2 === this.cardData.address_country),
        });

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
        const numberValidity =
            this.cardForm.cardNumber.changeStatus.complete &&
            !this.cardForm.cardNumber.changeStatus.error &&
            !this.cardForm.cardNumber.changeStatus.empty;
        const cvcValidity =
            this.cardForm.cardCvc.changeStatus.complete &&
            !this.cardForm.cardCvc.changeStatus.error &&
            !this.cardForm.cardCvc.changeStatus.empty;
        const expirationValidity =
            this.cardForm.cardExpiration.changeStatus.complete &&
            !this.cardForm.cardExpiration.changeStatus.error &&
            !this.cardForm.cardExpiration.changeStatus.empty;

        return this.formBillingAddress.valid && !this.process && numberValidity && cvcValidity && expirationValidity;
    }

    private updateBillingData(): void {
        const dataToServer = {
            ...this.formBillingAddress.getRawValue(),
            address_country: this.formBillingAddress.controls.address_country.value.Iso2,
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
                error => {
                    this.toaster.error(error.message);
                    this.process = false;
                },
            );
    }

    private deleteCurrentCard(createNew?: boolean): void {
        this.process = true;
        this.stripeService
            .deleteUserCreditCard(this.cardData.cardId)
            .pipe(takeUntil(this.$destroy))
            .subscribe(
                () => {
                    this.cardData = null;
                    this.process = false;
                    if (createNew) {
                        this.createStripeCardWithToken();
                    } else {
                        this.toaster.success('Your card has been removed');
                        this.clearChanges();
                    }
                },
                error => {
                    this.toaster.error(error.message);
                    this.process = false;
                },
            );
    }

    private updateOrDeleteCard(): void {
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
                () => this.clearChanges(),
            );
        }
    }
}
