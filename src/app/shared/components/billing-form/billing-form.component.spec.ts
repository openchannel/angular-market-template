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
import {
    MockCountryStateService,
    MockStripeLoaderService,
    MockStripeService,
    MockSvgIconRegistryService,
    MockToastrService,
} from '../../../../mock/services.mock';
import { StripeLoaderService } from '@core/services/stripe-loader.service';
import { CountryStateService, StripeService } from '@openchannel/angular-common-services';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { SvgIconRegistryService } from 'angular-svg-icon';

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
}

describe('BillingFormComponent', () => {
    let component: BillingFormComponent;
    let fixture: ComponentFixture<BillingFormComponent>;

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
                    { provide: StripeLoaderService, useClass: MockStripeLoaderService },
                    { provide: StripeService, useClass: MockStripeService },
                    { provide: CountryStateService, useClass: MockCountryStateService },
                    { provide: ToastrService, useClass: MockToastrService },
                    { provide: SvgIconRegistryService, useClass: MockSvgIconRegistryService },
                ],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        jest.clearAllMocks();
        fixture = TestBed.createComponent(BillingFormComponent);
        component = fixture.componentInstance;
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
        const mockStripe = new MockStripe();
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
        (component as any).stripeLoader.loadStripe = jest.fn().mockReturnValue(of(mockStripe));
        (component as any).countryStateService.getCountries = jest.fn().mockReturnValue(of(standardMockCardsInfo.countries));
        (component as any).stripeService.getUserCreditCards = jest.fn().mockReturnValue(of(standardMockCardsInfo.cardsInfo));
        (component as any).countryStateService.getStates = jest.fn().mockReturnValue(of(mockStatesResponse));
        fixture.detectChanges();
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
        const mockStripe = new MockStripe();
        component.formBillingAddress.patchValue({
            address_country: 'Test iso 2',
        });
        component.emptyStates = false;
        (component as any).stripeLoader.loadStripe = jest.fn().mockReturnValue(of(mockStripe));
        (component as any).countryStateService.getCountries = jest.fn().mockReturnValue(of(standardMockCardsInfo.countries));
        (component as any).countryStateService.getStates = jest.fn().mockReturnValue(throwError('Error'));
        (component as any).stripeService.getUserCreditCards = jest.fn().mockReturnValue(of(standardMockCardsInfo.cardsInfo));
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
        jest.spyOn((component as any).toaster, 'success');
        jest.spyOn(component.cardDataLoaded, 'emit');
        jest.spyOn(component.successAction, 'emit');
        const mockStripe = new MockStripe();
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
        (component as any).stripeLoader.loadStripe = jest.fn().mockReturnValue(of(mockStripe));
        (component as any).stripeService.getUserCreditCards = jest.fn().mockReturnValue(of(mockCardsInfoWithId.cardsInfo));
        (component as any).countryStateService.getCountries = jest.fn().mockReturnValue(of(standardMockCardsInfo.countries));
        (component as any).countryStateService.getStates = jest.fn().mockReturnValue(of(standardMockCardsInfo.mockStates));
        (component as any).stripeService.updateUserCreditCard = jest.fn().mockReturnValue(of(standardMockCardsInfo.cardsInfo));
        fixture.detectChanges();
        ocButtonMock.click.emit();
        tick();
        expect(component.billingAction).toHaveBeenCalled();
        expect((component as any).updateBillingData).toHaveBeenCalled();
        expect((component as any).toaster.success).toHaveBeenCalled();
        expect(component.cardDataLoaded.emit).toHaveBeenCalledWith(component.cardData);
        expect(component.successAction.emit).toHaveBeenCalled();
    }));

    it('should call billing action and delete current card', fakeAsync(() => {
        jest.spyOn(component, 'billingAction');
        jest.spyOn(component as any, 'updateOrDeleteCard');
        jest.spyOn(component as any, 'deleteCurrentCard');
        jest.spyOn(component as any, 'createStripeCardWithToken');
        jest.spyOn((component as any).toaster, 'success');
        jest.spyOn(component.cardDataLoaded, 'emit');
        jest.spyOn(component as any, 'fillCardForm');
        const mockStripe = new MockStripe();
        const ocButtonMock = getOcButtonDE().componentInstance;
        component.hideCardFormElements = false;
        (component as any).stripeLoader.loadStripe = jest.fn().mockReturnValue(of(mockStripe));
        (component as any).getFormsValidity = jest.fn().mockReturnValue(true);
        (component as any).countryStateService.getCountries = jest.fn().mockReturnValue(of(standardMockCardsInfo.countries));
        (component as any).stripeService.getUserCreditCards = jest.fn().mockReturnValue(of(standardMockCardsInfo.cardsInfo));
        (component as any).stripeService.deleteUserCreditCard = jest.fn().mockReturnValue(of({}));
        (component as any).stripeService.addUserCreditCard = jest.fn().mockReturnValue(of(standardMockCardsInfo.cardsInfo));
        (component as any).countryStateService.getStates = jest.fn().mockReturnValue(of(standardMockCardsInfo.mockStates));
        fixture.detectChanges();
        ocButtonMock.click.emit();
        tick();
        expect(component.billingAction).toHaveBeenCalled();
        expect((component as any).updateOrDeleteCard).toHaveBeenCalled();
        expect((component as any).deleteCurrentCard).toHaveBeenCalledWith(true);
        expect((component as any).createStripeCardWithToken).toHaveBeenCalled();
        expect((component as any).toaster.success).toHaveBeenCalled();
        expect(component.cardDataLoaded.emit).toHaveBeenCalledWith(component.cardData);
        expect((component as any).fillCardForm).toHaveBeenCalled();
    }));

    // it('should disable states field if country has no states', () => {
    //     const countryModel = {
    //         name: 'Test country',
    //         Iso2: 'Test iso',
    //     };
    //     component.emptyStates = false;
    //     (component as any).countryStateService.getStates = jest.fn().mockReturnValue(throwError('Error'));
    //     fixture.detectChanges();
    //     component.onCountriesChange(countryModel);
    //     expect(component.billingStates).toEqual([]);
    //     expect(component.formBillingAddress.get('address_state').disabled).toBeTruthy();
    // });
});
