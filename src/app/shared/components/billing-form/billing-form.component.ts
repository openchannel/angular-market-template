import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef } from '@angular/core';
import { Stripe, StripeCardCvcElement, StripeCardExpiryElement, StripeCardNumberElement, StripeElements } from '@stripe/stripe-js';
import { StripeCardNumberElementChangeEvent } from '@stripe/stripe-js/types/stripe-js/elements/card-number';
import { StripeCardExpiryElementChangeEvent } from '@stripe/stripe-js/types/stripe-js/elements/card-expiry';
import { StripeCardCvcElementChangeEvent } from '@stripe/stripe-js/types/stripe-js/elements/card-cvc';
import {
    CountriesModel,
    CountryModel,
    CountryStateService,
    CreditCard,
    State,
    StatesModel,
    StripeService,
    UserCreditCardsResponse,
} from '@openchannel/angular-common-services';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { StripeLoaderService } from '@core/services/stripe-loader.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, finalize, mergeMap, switchMap, takeUntil, tap } from 'rxjs/operators';
import { OcConfirmationModalComponent } from '@openchannel/angular-common-components';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { HttpHeaders } from '@angular/common/http';

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
    selector: 'app-billing-form',
    templateUrl: './billing-form.component.html',
    styleUrls: ['./billing-form.component.scss'],
})
export class BillingFormComponent implements OnInit, OnDestroy {
    /** Custom text for primary button type */
    @Input() successButtonText: string = 'Save';
    /** Redirect to the previous page on Cancel button click */
    @Input() goBackOnCancel: boolean = false;
    /** Redirect to the previous page on Cancel button click */
    @Input() additionalFieldsTemplate: TemplateRef<any>;
    /** Additionally prohibits any actions by button click */
    @Input() additionalButtonLock = false;
    /** Block the button from click if any process is going on and showing a spinner */
    @Input() process = false;
    /** Custom success toaster message on success button action  */
    @Input() successToasterMessage: string;
    /** Loaded data of the card, including a billing address */
    @Output() readonly cardDataLoaded: EventEmitter<CreditCard> = new EventEmitter<CreditCard>();
    /**
     * Notify the parent that primary button has been clicked.
     * This is necessary for additional validation
     */
    @Output() readonly successButtonPressed: EventEmitter<void> = new EventEmitter<void>();
    /** Button click event on a validated form */
    @Output() readonly successAction: EventEmitter<void> = new EventEmitter<void>();
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
    // saved card data
    cardData: CreditCard = null;

    formBillingAddress = new FormGroup({
        name: new FormControl('', Validators.required),
        address_line1: new FormControl('', Validators.required),
        address_line2: new FormControl(''),
        address_country: new FormControl('', Validators.required),
        address_state: new FormControl('', Validators.required),
        address_city: new FormControl('', Validators.required),
        address_zip: new FormControl('', Validators.required),
    });

    billingCountries: CountryModel[] = [];
    billingStates: State[] = [];
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
                this.subscribeToFormChanges();
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
        let countriesResponse: CountriesModel = null;
        let cardsInfoResponse: UserCreditCardsResponse = null;
        forkJoin({
            countries: this.countryStateService.getCountries(),
            cardsInfo: this.stripeService.getUserCreditCards(),
        })
            .pipe(
                tap(response => {
                    cardsInfoResponse = response.cardsInfo;
                    countriesResponse = response.countries;
                }),
                switchMap(() => {
                    const country: CountryModel = countriesResponse.data.find(
                        chosenCountry => chosenCountry.Iso2 === cardsInfoResponse.cards[0].address_country,
                    );
                    return this.countryStateService.getStates(country.name, new HttpHeaders({ 'x-handle-error': '404' }));
                }),
                catchError(() => {
                    return of({
                        data: {
                            states: [],
                        },
                    });
                }),
                finalize(() => (this.process = false)),
                takeUntil(this.$destroy),
            )
            .subscribe((response: StatesModel) => {
                this.billingCountries = countriesResponse.data;

                this.cardData = cardsInfoResponse.cards[0];
                this.billingStates = response.data.states.map(state => {
                    return { ...state, code: state.state_code };
                });
                if (this.cardData) {
                    this.fillCardForm();
                    this.cardDataLoaded.emit(this.cardData);
                }
            });
    }

    /**
     * Making actions according to the card data. There are adding new card, update data or delete card
     */
    billingAction(): void {
        this.successButtonPressed.emit();
        if (!this.additionalButtonLock) {
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
    }

    /**
     * Gets currentCountry on country change.
     */
    onCountriesChange(country: CountryModel): void {
        if (country.Iso2 !== this.formBillingAddress.controls.address_country.value) {
            this.getStates(country.name);
        }
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
                this.billingStates = response.data.states.map(state => {
                    return { ...state, code: state.state_code };
                });
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
        if (this.goBackOnCancel) {
            history.back();
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
            address_state: this.formBillingAddress.controls.address_state.value.code,
        };
        this.stripe.createToken(this.cardForm.cardNumber.element, dataToStripe).then(resp => {
            this.stripeService
                .addUserCreditCard(resp.token.id)
                .pipe(takeUntil(this.$destroy))
                .subscribe(
                    cardResponse => {
                        this.toaster.success(this.successToasterMessage || 'Card has been added');
                        this.cardData = cardResponse.cards[0];
                        this.cardDataLoaded.emit(this.cardData);
                        if (this.cardData) {
                            this.fillCardForm();
                        }
                        this.successAction.emit();
                    },
                    err => {
                        this.toaster.error(err.message);
                        this.process = false;
                    },
                );
        });
    }

    private fillCardForm(): void {
        this.formBillingAddress.patchValue({
            ...this.cardData,
            address_country: this.billingCountries.find(country => country.Iso2 === this.cardData.address_country),
            address_state: this.billingStates.find(state => state.code === this.cardData.address_state),
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
            address_state: this.formBillingAddress.controls.address_state.value.code,
        };
        this.process = true;
        this.stripeService
            .updateUserCreditCard(this.cardData.cardId, dataToServer)
            .pipe(takeUntil(this.$destroy))
            .subscribe(
                cardResponse => {
                    this.toaster.success(this.successToasterMessage || 'Your billing data has been updated');
                    this.cardData = cardResponse.cards[0];
                    this.process = false;
                    this.cardDataLoaded.emit(this.cardData);
                    this.successAction.emit();
                },
                err => {
                    this.toaster.error(err.message);
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
                        this.cardDataLoaded.emit(this.cardData);
                        this.toaster.success('Your card has been removed');
                        this.clearChanges();
                    }
                },
                err => {
                    this.toaster.error(err.message);
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

    private subscribeToFormChanges(): void {
        this.formBillingAddress.valueChanges.pipe(takeUntil(this.$destroy)).subscribe(changes => {
            const isFieldsValid =
                this.formBillingAddress.controls.address_country.valid &&
                this.formBillingAddress.controls.address_state.valid &&
                this.formBillingAddress.controls.address_zip.valid &&
                this.formBillingAddress.controls.address_city.valid;

            const isFieldFilled = changes.address_country && changes.address_state && changes.address_zip && changes.address_city;

            if (isFieldsValid && isFieldFilled) {
                this.cardDataLoaded.emit({
                    ...changes,
                    address_country: changes.address_country.Iso2,
                    address_state: changes.address_state.code,
                });
            }
        });
    }
}
