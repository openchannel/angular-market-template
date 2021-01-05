import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountManagementRoutingModule } from './account-management-routing.module';
import {MyProfileComponent} from './my-profile/my-profile.component';
import {ChangePasswordComponent} from './my-profile/change-password/change-password.component';
import {GeneralProfileComponent} from './my-profile/general/general-profile.component';
import {SharedModule} from '@shared/shared.module';
import { MyAppsComponent } from './my-apps/my-apps.component';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {ManagementComponent} from './my-company/management/management.component';
import {MyCompanyComponent} from './my-company/my-company.component';


@NgModule({
  declarations: [
    MyProfileComponent,
    ChangePasswordComponent,
    GeneralProfileComponent,
    MyAppsComponent,
    ManagementComponent,
    MyCompanyComponent
  ],
  imports: [
    CommonModule,
    AccountManagementRoutingModule,
    SharedModule,
    InfiniteScrollModule,
  ],
})
export class AccountManagementModule { }
