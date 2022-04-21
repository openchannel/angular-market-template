import { ComponentFixture, discardPeriodicTasks, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';

import { CheckoutComponent } from './checkout.component';
import {
    mockAppsService,
    mockAppVersionService,
    mockInviteUserAccountServiceProvider,
    mockLoadingBarService,
    mockStripeLoaderService,
    mockStripeService,
    mockToastrService,
} from '../../../../mock/providers.mock';
import { Purchase, StripeService, UserAccount, UserAccountService } from '@openchannel/angular-common-services';
import { MockAppsService, MockUserRoleService } from '../../../../mock/services.mock';
import { times } from 'lodash';
import {
    MockAppBillingForm,
    MockButtonComponent,
    MockOcConsentComponent,
    MockPageTitleComponent,
} from '../../../../mock/components.mock';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { FullAppData } from '@openchannel/angular-common-components/src/lib/common-components';
import { pageConfig } from '../../../../assets/data/configData';
import { of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

const userId = 'testUserId';

const mainUserAccount: UserAccount = {
    userAccountId: 'mainUserAccountId',
    userId,
    name: 'mainUserAccount',
    roles: [MockUserRoleService.ADMIN_ROLE_ID],
} as UserAccount;

const userAccounts: UserAccount[] = times(3, index => ({
    userId,
    userAccountId: `userAccountId_${index}`,
    name: `userAccountName_${index}`,
    roles: [MockUserRoleService.ADMIN_ROLE_ID],
}));

describe('CheckoutComponent', () => {
    let component: CheckoutComponent;
    let fixture: ComponentFixture<CheckoutComponent>;
    let router: Router;
    let location: Location;

    const getAppPageTitleComponent = () => fixture.debugElement.query(By.directive(MockPageTitleComponent));
    const getAppBillingFormComponent = () => fixture.debugElement.query(By.directive(MockAppBillingForm));
    const getOcConsentComponent = () => fixture.debugElement.query(By.directive(MockOcConsentComponent));

    let stripeService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CheckoutComponent, MockAppBillingForm, MockPageTitleComponent, MockButtonComponent, MockOcConsentComponent],
            providers: [
                mockLoadingBarService(),
                mockAppVersionService(),
                mockAppsService(),
                mockInviteUserAccountServiceProvider(mainUserAccount, userAccounts),
                mockToastrService(),
                mockStripeLoaderService(),
                mockStripeService(),
            ],
            imports: [RouterTestingModule],
        }).compileComponents();

        fixture = TestBed.createComponent(CheckoutComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();

        jest.resetAllMocks();

        // Setup router for the component
        location = TestBed.inject(Location);
        router = TestBed.inject(Router);

        stripeService = TestBed.inject(StripeService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should check app-page-title inject values and click event', fakeAsync(() => {
        const appPageTitleComponent = getAppPageTitleComponent().componentInstance;

        expect(appPageTitleComponent.pageTitle).toBe('Checkout');
        expect(appPageTitleComponent.navigateText).toBe('Back');
        // test goBack() method
        const originalHref = window.location.href;
        history.pushState({}, 'testRoute', '/testRoute');

        appPageTitleComponent.navigateClick.emit();

        addEventListener('popstate', () => {
            expect(window.location.href).toEqual(originalHref);
        });
        flush();
    }));

    it('should check app-billing-form inject values and event emitters', fakeAsync(() => {
        component.app = MockAppsService.MOCK_APPS_PAGE.list.map(app => new FullAppData(app, pageConfig.fieldMappings))[0];

        const mockPurchase: Purchase = {
            models: [
                {
                    appId: component.app.appId,
                    modelId: component.app.model[0].modelId,
                },
            ],
        };

        const appBillingFormComponent = getAppBillingFormComponent().componentInstance;

        jest.spyOn(stripeService, 'getTaxesAndPayment');
        jest.spyOn(stripeService, 'makePurchase');
        jest.spyOn(component, 'onCardDataLoaded');

        expect(appBillingFormComponent).not.toBeNull();
        expect(appBillingFormComponent.goBackOnCancel).toBeTruthy();
        expect(appBillingFormComponent.successButtonText).toBe('Pay now');
        expect(appBillingFormComponent.process).toBeFalsy();
        expect(appBillingFormComponent.additionalButtonLock).toBeTruthy();
        expect(appBillingFormComponent.successToasterMessage).toBe('You successfully bought this app!');
        expect(appBillingFormComponent.additionalFieldsTemplate).not.toBeNull();
        discardPeriodicTasks();

        appBillingFormComponent.cardDataLoaded.emit({});
        expect(stripeService.getTaxesAndPayment).toBeCalled();
        tick();
        expect(component.paymentAndTaxes).not.toBeUndefined();
        discardPeriodicTasks();

        appBillingFormComponent.successButtonPressed.emit({});
        expect(component.validateCheckbox).toBeTruthy();
        discardPeriodicTasks();

        appBillingFormComponent.successAction.emit({});
        expect(stripeService.makePurchase).toBeCalledWith(mockPurchase);
        tick();
        expect(component.purchaseSuccessful).toBeTruthy();
        expect(component.purchaseProcess).toBeFalsy();
        discardPeriodicTasks();
    }));

    it('should check onSuccessAction() error handling', fakeAsync(() => {
        const toastrService = TestBed.inject(ToastrService);

        component.app = MockAppsService.MOCK_APPS_PAGE.list.map(app => new FullAppData(app, pageConfig.fieldMappings))[0];

        const mockPurchase: Purchase = {
            models: [
                {
                    appId: component.app.appId,
                    modelId: component.app.model[0].modelId,
                },
            ],
        };

        jest.spyOn(stripeService, 'makePurchase').mockReturnValueOnce(throwError('Error'));
        jest.spyOn(toastrService, 'error');

        const appBillingFormComponent = getAppBillingFormComponent().componentInstance;

        appBillingFormComponent.successAction.emit({});
        expect(stripeService.makePurchase).toBeCalledWith(mockPurchase);
        tick();
        expect(toastrService.error).toBeCalled();
        expect(component.purchaseProcess).toBeFalsy();
        discardPeriodicTasks();
    }));

    it('should check loadCurrentUserDetails() method work', fakeAsync(() => {
        const mockUserAccount: UserAccount = {
            userAccountId: 'mainUserAccountId',
            userId,
            name: 'mainUserAccount',
            roles: [MockUserRoleService.ADMIN_ROLE_ID],
        } as UserAccount;

        const accountService = TestBed.inject(UserAccountService);

        jest.spyOn((component as any).loader, 'start');
        jest.spyOn((component as any).loader, 'complete');
        jest.spyOn(accountService, 'getUserAccount').mockReturnValueOnce(of(mockUserAccount));

        (component as any).loadCurrentUserDetails();
        expect((component as any).loader.start).toBeCalled();
        expect(accountService.getUserAccount).toBeCalled();

        tick();

        expect(component.user).toEqual(mockUserAccount);
        expect((component as any).loader.complete).toBeCalled();
        discardPeriodicTasks();

        jest.spyOn(accountService, 'getUserAccount').mockReturnValueOnce(throwError('Error'));

        tick();

        expect((component as any).loader.complete).toBeCalled();
        discardPeriodicTasks();
    }));
});
