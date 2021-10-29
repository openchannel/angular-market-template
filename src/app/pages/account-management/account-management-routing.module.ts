import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { MyAppsComponent } from './my-apps/my-apps.component';
import { MyCompanyComponent } from './my-company/my-company.component';
import { AuthGuard } from '@core/guards/auth.guard';

const routes: Routes = [
    {
        path: 'my-profile',
        data: { title: 'My profile' },
        children: [
            { path: 'profile-details', component: MyProfileComponent, canActivate: [AuthGuard] },
            { path: 'password', component: MyProfileComponent, canActivate: [AuthGuard] },
        ],
    },
    { path: 'my-apps', component: MyAppsComponent, canActivate: [AuthGuard], data: { title: 'Manage apps' } },
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
