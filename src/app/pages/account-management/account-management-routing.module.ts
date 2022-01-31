import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { MyAppsComponent } from './my-apps/my-apps.component';
import { MyCompanyComponent } from './my-company/my-company.component';
import { AuthGuard } from '@core/guards/auth.guard';
import { siteConfig } from 'assets/data/siteConfig';
import { PaymentsGateways } from '@openchannel/angular-common-services';

const subPaths =
    siteConfig.paymentsEnabled && siteConfig.paymentsGateway === PaymentsGateways.STRIPE
        ? [
              { path: 'billing', component: MyProfileComponent, canActivate: [AuthGuard] },
              { path: 'billing-history', component: MyProfileComponent, canActivate: [AuthGuard] },
          ]
        : [];

const routes: Routes = [
    // Redirect to the first page in the block (`profile-details`),
    // when the route doesn't contain an end part, `profile-details`, for example
    {
        path: 'my-profile',
        pathMatch: 'full',
        redirectTo: 'my-profile/profile-details',
    },
    {
        path: 'my-profile',
        data: { title: 'My profile' },
        children: [
            { path: 'profile-details', component: MyProfileComponent, canActivate: [AuthGuard] },
            { path: 'password', component: MyProfileComponent, canActivate: [AuthGuard] },
            ...subPaths,
        ],
    },
    { path: 'my-apps', component: MyAppsComponent, canActivate: [AuthGuard], data: { title: 'Manage apps' } },

    // Redirect to the first page in the block (`company-details`),
    // when the route doesn't contain an end part, `company-details`, for example
    {
        path: 'my-company',
        pathMatch: 'full',
        redirectTo: 'my-company/company-details',
    },
    {
        path: 'my-company',
        data: { title: 'My company' },
        children: [
            { path: 'company-details', component: MyCompanyComponent, canActivate: [AuthGuard] },
            { path: 'user-management', component: MyCompanyComponent, canActivate: [AuthGuard] },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AccountManagementRoutingModule {}
