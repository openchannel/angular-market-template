import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { BillingFormComponent } from './billing-form.component';
import {
    MockButtonComponent,
    MockErrorComponent,
    MockFormComponent,
    MockInputComponent,
    MockLabelComponent,
    MockSelectComponent,
    MockSvgIconComponent,
} from '../../../../mock/components.mock';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import {
    mockStripeService,
    mockStripeLoaderService,
    mockCountryStateService,
    mockToastrService,
    mockSvgIconRegistryService,
} from '../../../../mock/providers.mock';
import { CountryStateService, StripeService } from '@openchannel/angular-common-services';
import { ToastrService } from 'ngx-toastr';
import { StripeLoaderService } from '@core/services/stripe-loader.service';

class MockStripe {
    createToken(): Promise<any> {
        return new Promise(resolve => resolve({ token: { id: 123 } }));
    }
    elements(): MockStripeElements {
        return new MockStripeElements();
    }
}

class MockStripeElements {
    create(): any {
        return new MockStripeElement();
    }
}

class MockStripeElement {
    mount(): any {
        return null;
    }
    on(event: string, func: any): any {
        return null;
    }
    clear(): any {
        return null;
    }
}

describe('BillingFormComponent', () => {
    let component: BillingFormComponent;
    let fixture: ComponentFixture<BillingFormComponent>;
    let countryStateService: CountryStateService;
    let toastrService: ToastrService;
    let stripeService: StripeService;
    let stripeLoaderService: StripeLoaderService;

    const getOcButtonDE = () => fixture.debugElement.query(By.directive(MockButtonComponent));
    const standardMockCardsInfo = {
        countries: {
            data: [
                {
                    name: 'test country',
                    Iso2: 'address country',
                },
            ],
            error: '',
            message: '',
        },
        mockStates: {
            data: {
                states: [
                    {
                        name: 'state name',
                        state_code: 'address state',
                    },
                ],
            },
        },
        cardsInfo: {
            cards: [
                {
                    exp_year: 3333,
                    exp_month: 5,
                    last4: 'string1',
                    brand: 'string1',
                    name: 'string1',
                    isDefault: false,
                    address_country: 'address country',
                    address_state: 'address state',
                },
            ],
        },
    };
    const mockEmptyCardsData = {
        cards: [],
    };

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    BillingFormComponent,
                    MockSvgIconComponent,
                    MockLabelComponent,
                    MockInputComponent,
                    MockErrorComponent,
                    MockSelectComponent,
                    MockButtonComponent,
                    MockFormComponent,
                ],
                imports: [FormsModule, ReactiveFormsModule],
                providers: [
                    mockStripeLoaderService(),
                    mockStripeService(),
                    mockCountryStateService(),
                    mockToastrService(),
                    mockSvgIconRegistryService(),
                ],
            }).compileComponents();
            countryStateService = TestBed.inject(CountryStateService);
            toastrService = TestBed.inject(ToastrService);
            stripeService = TestBed.inject(StripeService);
            stripeLoaderService = TestBed.inject(StripeLoaderService);
        }),
    );

    beforeEach(() => {
        jest.clearAllMocks();
        fixture = TestBed.createComponent(BillingFormComponent);
        component = fixture.componentInstance;
        const mockStripe = new MockStripe();
        stripeLoaderService.loadStripe = jest.fn().mockReturnValue(of(mockStripe));
        countryStateService.getCountries = jest.fn().mockReturnValue(of(standardMockCardsInfo.countries));
        countryStateService.getStates = jest.fn().mockReturnValue(of(standardMockCardsInfo.mockStates));
        stripeService.getUserCreditCards = jest.fn().mockReturnValue(of(standardMockCardsInfo.cardsInfo));
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit valid form value when it changes', () => {
        jest.spyOn(component as any, 'subscribeToFormChanges');
        jest.spyOn(component.cardDataLoaded, 'emit');
        (component as any).subscribeToFormChanges();
        component.formBillingAddress.patchValue({
            address_country: 'address_country',
            address_state: 'address_state',
            address_zip: 'address_zip',
            address_city: 'address_city',
        });
        fixture.detectChanges();
        expect((component as any).subscribeToFormChanges).toHaveBeenCalled();
        expect(component.cardDataLoaded.emit).toHaveBeenCalled();
    });

    it('should update states list on CountriesChange', fakeAsync(() => {
        jest.spyOn(component, 'getStates');
        component.formBillingAddress.patchValue({
            address_country: 'Test iso 2',
        });
        component.billingStates = [
            {
                name: 'Initial state',
                code: 'Initial code',
            },
        ];
        const countryModel = {
            name: 'Test country',
            Iso2: 'Test iso',
        };
        const mockStatesResponse = {
            data: {
                states: [
                    {
                        name: 'Changed state',
                        state_code: 'Changed code',
                    },
                ],
            },
            error: '',
            message: '',
        };
        countryStateService.getStates = jest.fn().mockReturnValue(of(mockStatesResponse));
        fixture.detectChanges();
        tick();
        component.emptyStates = true;
        component.onCountriesChange(countryModel);
        tick();
        expect(component.getStates).toHaveBeenCalled();
        expect(component.billingStates).toEqual([{ state_code: 'Changed code', code: 'Changed code', name: 'Changed state' }]);
        expect(component.formBillingAddress.get('address_state').enabled).toBeTruthy();
    }));

    it('should disable states field if country has no states', fakeAsync(() => {
        jest.spyOn(component, 'getStates');
        const countryModel = {
            name: 'Test country',
            Iso2: 'Test iso',
        };
        component.formBillingAddress.patchValue({
            address_country: 'Test iso 2',
        });
        component.emptyStates = false;
        countryStateService.getStates = jest.fn().mockReturnValue(throwError('Error'));
        fixture.detectChanges();
        component.onCountriesChange(countryModel);
        tick();
        expect(component.getStates).toHaveBeenCalled();
        expect(component.billingStates).toEqual([]);
        expect(component.formBillingAddress.get('address_state').disabled).toBeTruthy();
    }));

    it('should call billing action and update billing data', fakeAsync(() => {
        jest.spyOn(component, 'billingAction');
        jest.spyOn(component as any, 'updateBillingData');
        jest.spyOn(toastrService, 'success');
        jest.spyOn(component.cardDataLoaded, 'emit');
        jest.spyOn(component.successAction, 'emit');
        const ocButtonMock = getOcButtonDE().componentInstance;
        const mockCardsInfoWithId = {
            countries: {
                data: [
                    {
                        name: 'test country',
                        Iso2: 'address country',
                    },
                ],
                error: '',
                message: '',
            },
            mockStates: {
                data: {
                    states: [
                        {
                            name: 'state name',
                            state_code: 'address state',
                        },
                    ],
                },
            },
            cardsInfo: {
                cards: [
                    {
                        cardId: 'card id',
                        exp_year: 3333,
                        exp_month: 5,
                        last4: 'string1',
                        brand: 'string1',
                        name: 'string1',
                        isDefault: false,
                        address_country: 'address country',
                        address_state: 'address state',
                    },
                ],
            },
        };
        component.formBillingAddress.patchValue({
            name: 'Test name?',
            address_line1: 'Address line 1',
            address_city: 'Address city',
            address_zip: 'Address zip',
        });
        stripeService.getUserCreditCards = jest.fn().mockReturnValue(of(mockCardsInfoWithId.cardsInfo));
        stripeService.updateUserCreditCard = jest.fn().mockReturnValue(of(standardMockCardsInfo.cardsInfo));
        fixture.detectChanges();
        ocButtonMock.click.emit();
        tick();
        expect(component.billingAction).toHaveBeenCalled();
        expect((component as any).updateBillingData).toHaveBeenCalled();
        expect(toastrService.success).toHaveBeenCalled();
        expect(component.cardDataLoaded.emit).toHaveBeenCalledWith(component.cardData);
        expect(component.successAction.emit).toHaveBeenCalled();
    }));

    it('should call billing action and delete current card', fakeAsync(() => {
        jest.spyOn(component, 'billingAction');
        jest.spyOn(component as any, 'updateOrDeleteCard');
        jest.spyOn(component as any, 'deleteCurrentCard');
        jest.spyOn(component as any, 'createStripeCardWithToken');
        jest.spyOn(toastrService, 'success');
        jest.spyOn(component.cardDataLoaded, 'emit');
        jest.spyOn(component as any, 'fillCardForm');
        const ocButtonMock = getOcButtonDE().componentInstance;
        component.hideCardFormElements = false;
        (component as any).getFormsValidity = jest.fn().mockReturnValue(true);
        stripeService.addUserCreditCard = jest.fn().mockReturnValue(of(standardMockCardsInfo.cardsInfo));
        fixture.detectChanges();
        ocButtonMock.click.emit();
        tick();
        expect(component.billingAction).toHaveBeenCalled();
        expect((component as any).updateOrDeleteCard).toHaveBeenCalled();
        expect((component as any).deleteCurrentCard).toHaveBeenCalledWith(true);
        expect((component as any).createStripeCardWithToken).toHaveBeenCalled();
        expect(toastrService.success).toHaveBeenCalled();
        expect(component.cardDataLoaded.emit).toHaveBeenCalledWith(component.cardData);
        expect((component as any).fillCardForm).toHaveBeenCalled();
    }));

    it('should call billing action and createStripeCardWithToken', fakeAsync(() => {
        jest.spyOn(component, 'billingAction');
        jest.spyOn(component as any, 'createStripeCardWithToken');
        jest.spyOn(toastrService, 'error');
        const ocButtonMock = getOcButtonDE().componentInstance;
        (component as any).getFormsValidity = jest.fn().mockReturnValue(true);
        stripeService.addUserCreditCard = jest.fn().mockReturnValue(of(standardMockCardsInfo.cardsInfo));
        stripeService.getUserCreditCards = jest.fn().mockReturnValue(of(mockEmptyCardsData));
        fixture.detectChanges();
        ocButtonMock.click.emit();
        tick();
        expect(component.billingAction).toHaveBeenCalled();
        expect((component as any).createStripeCardWithToken).toHaveBeenCalled();
    }));

    it('should call billing action and show toaster error', fakeAsync(() => {
        jest.spyOn(component, 'billingAction');
        jest.spyOn(component as any, 'createStripeCardWithToken');
        jest.spyOn(toastrService, 'error');
        jest.spyOn(stripeService, 'addUserCreditCard').mockReturnValue(throwError('Error'));
        const ocButtonMock = getOcButtonDE().componentInstance;
        stripeService.getUserCreditCards = jest.fn().mockReturnValue(of(mockEmptyCardsData));
        (component as any).getFormsValidity = jest.fn().mockReturnValue(true);
        fixture.detectChanges();
        ocButtonMock.click.emit();
        tick();
        expect(component.billingAction).toHaveBeenCalled();
        expect((component as any).createStripeCardWithToken).toHaveBeenCalled();
        expect(toastrService.error).toHaveBeenCalled();
        expect(component.process).toEqual(false);
    }));

    it('should clear changes and fill card form', fakeAsync(() => {
        jest.spyOn(component as any, 'fillCardForm');
        fixture.detectChanges();
        component.clearChanges();
        tick();
        expect((component as any).fillCardForm).toHaveBeenCalled();
        expect(component.hideCardFormElements).toBe(false);
        expect(component.formBillingAddress.controls.address_country.value).toEqual({ name: 'test country', Iso2: 'address country' });
        expect(component.formBillingAddress.controls.address_state.value).toEqual({
            name: 'state name',
            state_code: 'address state',
            code: 'address state',
        });
    }));

    it('should clear changes and reset address form and clear stripe elements', () => {
        jest.spyOn(component as any, 'fillCardForm');
        stripeService.getUserCreditCards = jest.fn().mockReturnValue(of(mockEmptyCardsData));
        fixture.detectChanges();
        component.clearChanges();
        expect(component.formBillingAddress.controls.name.value).toEqual(null);
    });

    it('should show stripe form on input click', () => {
        component.hideCardFormElements = true;
        component.showStripeForm();
        expect(component.hideCardFormElements).toEqual(false);
        expect(component.formBillingAddress.controls.name.value).toEqual('');
    });

    it('should get forms validity', () => {
        component.cardForm.cardNumber.changeStatus.empty = false;
        component.cardForm.cardNumber.changeStatus.complete = true;
        component.cardForm.cardExpiration.changeStatus.empty = false;
        component.cardForm.cardExpiration.changeStatus.complete = true;
        component.cardForm.cardCvc.changeStatus.empty = false;
        component.cardForm.cardCvc.changeStatus.complete = true;
        component.formBillingAddress.patchValue({
            name: 'test form name',
            address_line1: 'address_line1',
            address_country: 'address_country',
            address_state: 'address_state',
            address_city: 'address_city',
            address_zip: 'address_zip',
        });
        const formValidity = (component as any).getFormsValidity();
        expect(formValidity).toBe(true);
    });

    it('should call billing action, updateOrDeleteCard and open confirmation modal', fakeAsync(() => {
        jest.spyOn(component, 'billingAction');
        jest.spyOn(component as any, 'updateOrDeleteCard');
        jest.spyOn((component as any).modal, 'open');
        const ocButtonMock = getOcButtonDE().componentInstance;
        component.hideCardFormElements = false;
        (component as any).getFormsValidity = jest.fn().mockReturnValue(false);
        fixture.detectChanges();
        ocButtonMock.click.emit();
        tick();
        expect(component.billingAction).toHaveBeenCalled();
        expect((component as any).updateOrDeleteCard).toHaveBeenCalled();
        expect((component as any).modal.open).toHaveBeenCalled();
    }));
});
