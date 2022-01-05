import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountManagementRoutingModule } from './account-management-routing.module';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { ChangePasswordComponent } from './my-profile/change-password/change-password.component';
import { GeneralProfileComponent } from './my-profile/general/general-profile.component';
import { SharedModule } from '@shared/shared.module';
import { MyAppsComponent } from './my-apps/my-apps.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ManagementComponent } from './my-company/management/management.component';
import { MyCompanyComponent } from './my-company/my-company.component';
import { CompanyDetailsComponent } from './my-company/company-details/company-details.component';
import { OcFormComponentsModule, OcManagementComponentsModule, OcAuthComponentsModule } from '@openchannel/angular-common-components';
import { BillingComponent } from './my-profile/billing/billing.component';
import { ReactiveFormsModule } from '@angular/forms';
import {ButtonActionModule} from '@features/button-action/button-action.module';

@NgModule({
    declarations: [
        MyProfileComponent,
        ChangePasswordComponent,
        GeneralProfileComponent,
        MyAppsComponent,
        ManagementComponent,
        MyCompanyComponent,
        CompanyDetailsComponent,
        BillingComponent,
    ],
    imports: [
        CommonModule,
        AccountManagementRoutingModule,
        SharedModule,
        InfiniteScrollModule,
        OcFormComponentsModule,
        OcManagementComponentsModule,
        OcAuthComponentsModule,
        OcAuthComponentsModule,
        ReactiveFormsModule,
        ButtonActionModule,
    ],
})
export class AccountManagementModule {}
