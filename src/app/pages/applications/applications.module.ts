import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApplicationsRoutingModule } from './applications-routing.module';
import { AppDetailComponent } from './app-detail/app-detail.component';
import { AppSearchComponent } from './app-search/app-search.component';
import { SharedModule } from '@shared/shared.module';
import { FormModalComponent } from './form-modal/form-modal.component';
import { OcFormComponentsModule } from '@openchannel/angular-common-components';
import { CheckoutComponent } from './checkout/checkout.component';
import { ButtonActionModule } from '@features/button-action/button-action.module';

@NgModule({
    declarations: [AppDetailComponent, AppSearchComponent, FormModalComponent, CheckoutComponent],
    imports: [CommonModule, ApplicationsRoutingModule, SharedModule, OcFormComponentsModule, ButtonActionModule],
})
export class ApplicationsModule {}
