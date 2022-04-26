import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { BillingFormComponent } from './billing-form.component';
import {
    MockButtonComponent,
    MockCountryStateService,
    MockErrorComponent,
    MockFormComponent,
    MockInputComponent,
    MockLabelComponent,
    MockSelectComponent,
    MockStripeLoaderService,
    MockStripeService,
    MockSvgIconComponent,
    MockSvgIconRegistryService,
    MockToastrService,
} from '../../../../mock/mock';
import { StripeLoaderService } from '@core/services/stripe-loader.service';
import { CountryStateService, StripeService } from '@openchannel/angular-common-services';
import { ToastrService } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { SvgIconRegistryService } from 'angular-svg-icon';

describe('BillingFormComponent', () => {
    let component: BillingFormComponent;
    let fixture: ComponentFixture<BillingFormComponent>;

    const getOcButtonDE = () => fixture.debugElement.query(By.directive(MockButtonComponent));

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
                imports: [ReactiveFormsModule],
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
        fixture = TestBed.createComponent(BillingFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit valid form value when it changes', fakeAsync(() => {
        jest.spyOn(component as any, 'subscribeToFormChanges');
        jest.spyOn(component.cardDataLoaded, 'emit');
        (component as any).subscribeToFormChanges();
        // component.formBillingAddress.patchValue()??????????? // TODO
        component.formBillingAddress.controls.address_country.setValue('address_country');
        component.formBillingAddress.controls.address_state.setValue('address_state');
        component.formBillingAddress.controls.address_zip.setValue('address_zip');
        component.formBillingAddress.controls.address_city.setValue('address_city');

        fixture.detectChanges();
        tick();
        expect((component as any).subscribeToFormChanges).toHaveBeenCalled();
        expect(component.cardDataLoaded.emit).toHaveBeenCalled();
    }));

    it('should update states list on CountriesChange', () => {
        const countryModel = {
            name: 'Test country',
            Iso2: 'Test iso',
        };
        const mockStatesResponse = {
            data: {
                states: [
                    {
                        name: 'Test state',
                        state_code: 'Test code',
                    },
                ],
            },
            error: '',
            message: '',
        };
        (component as any).countryStateService.getStates = jest.fn().mockReturnValue(of(mockStatesResponse));
        component.onCountriesChange(countryModel);
        expect(component.billingStates).toEqual([{ state_code: 'Test code', code: 'Test code', name: 'Test state' }]);
        expect(component.formBillingAddress.get('address_state').enabled).toBeTruthy();
    });

    it('should disable states field if country has no states', () => {
        const countryModel = {
            name: 'Test country',
            Iso2: 'Test iso',
        };
        component.emptyStates = false;
        fixture.detectChanges();
        (component as any).countryStateService.getStates = jest.fn().mockReturnValue(throwError('Error'));
        component.onCountriesChange(countryModel);
        expect(component.billingStates).toEqual([]);
        expect(component.formBillingAddress.get('address_state').disabled).toBeTruthy();
    });

    it('should call billing action and update billing data', fakeAsync(() => {
        jest.spyOn(component, 'billingAction');
        jest.spyOn(component as any, 'updateBillingData');
        jest.spyOn((component as any).toaster, 'success');
        jest.spyOn(component.cardDataLoaded, 'emit');
        jest.spyOn(component.successAction, 'emit');
        const ocButtonMock = getOcButtonDE().componentInstance;
        component.hideCardFormElements = true;
        component.cardData = {
            cardId: 'string',
            exp_year: 2222,
            exp_month: 10,
            last4: 'string',
            brand: 'string',
            name: 'string',
            isDefault: true,
        };
        component.formBillingAddress.patchValue({
            name: 'Test name?',
            address_line1: 'Address line 1',
            address_country: {
                Iso2: 'Address country Iso2',
            },
            address_state: {
                code: 'Address state code',
            },
            address_city: 'Address city',
            address_zip: 'Address zip',
        });
        const cardDataMockResponse = {
            cards: [
                {
                    cardId: 'string1',
                    exp_year: 3333,
                    exp_month: 5,
                    last4: 'string1',
                    brand: 'string1',
                    name: 'string1',
                    isDefault: false,
                },
            ],
        };
        (component as any).stripeService.updateUserCreditCard = jest.fn().mockReturnValue(of(cardDataMockResponse));
        ocButtonMock.click.emit();
        tick();
        expect(component.billingAction).toHaveBeenCalled();
        expect((component as any).updateBillingData).toHaveBeenCalled();
        expect((component as any).toaster.success).toHaveBeenCalled();
        expect(component.cardDataLoaded.emit).toHaveBeenCalledWith(component.cardData);
        expect(component.successAction.emit).toHaveBeenCalled();
    }));

    it('should call billing action and delete current card', () => {
        jest.spyOn(component, 'billingAction');
        jest.spyOn(component as any, 'updateOrDeleteCard');
        const ocButtonMock = getOcButtonDE().componentInstance;
        component.hideCardFormElements = false;
        component.cardData = {
            cardId: 'string',
            exp_year: 2222,
            exp_month: 10,
            last4: 'string',
            brand: 'string',
            name: 'string',
            isDefault: true,
        };
        (component as any).getFormsValidity = jest.fn().mockReturnValue(true);
        // (component as any).stripeService.deleteUserCreditCard = jest.fn().mockReturnValue(of(1));
        fixture.detectChanges();
        ocButtonMock.click.emit();
        expect(component.billingAction).toHaveBeenCalled();
        expect((component as any).updateOrDeleteCard).toHaveBeenCalled();
        expect((component as any).deleteCurrentCard).toHaveBeenCalledWith(true);
        expect((component as any).createStripeCardWithToken).toHaveBeenCalled();
    });
});
