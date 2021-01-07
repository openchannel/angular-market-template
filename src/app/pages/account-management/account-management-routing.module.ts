import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MyProfileComponent} from './my-profile/my-profile.component';
import {MyAppsComponent} from './my-apps/my-apps.component';
import { AuthGuard } from '../../_guards/auth.guard';
import {MyCompanyComponent} from './my-company/my-company.component';

const routes: Routes = [
  {path: 'profile', component: MyProfileComponent, canActivate: [AuthGuard]},
  {path: 'apps', component: MyAppsComponent, canActivate: [AuthGuard]},
  {path: 'company', component: MyCompanyComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountManagementRoutingModule { }
