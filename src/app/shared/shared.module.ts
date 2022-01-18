import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { OcCommonLibModule, OcMarketComponentsModule } from '@openchannel/angular-common-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { PermissionDirective } from './directive/permission.directive';
import { CollapseWithTitleComponent } from './components/collapse-with-title/collapse-with-title.component';
import { PageTitleComponent } from '@shared/components/page-title/page-title.component';
import { TransactionAmountPipe } from './pipes/transaction-amount.pipe';
import { BillingFormComponent } from './components/billing-form/billing-form.component';
import { CheckoutPricePipe } from './pipes/checkout-price.pipe';

@NgModule({
    declarations: [
        PermissionDirective,
        CollapseWithTitleComponent,
        PageTitleComponent,
        TransactionAmountPipe,
        BillingFormComponent,
        CheckoutPricePipe,
    ],
    imports: [CommonModule, OcCommonLibModule, OcMarketComponentsModule, ReactiveFormsModule, FormsModule, NgbModule, NgSelectModule],
    exports: [
        OcCommonLibModule,
        OcMarketComponentsModule,
        FormsModule,
        PermissionDirective,
        NgbModule,
        CollapseWithTitleComponent,
        PageTitleComponent,
        TransactionAmountPipe,
        BillingFormComponent,
        CheckoutPricePipe,
    ],
    providers: [DecimalPipe],
})
export class SharedModule {}
