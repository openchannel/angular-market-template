import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MyProfileComponent} from './my-profile/my-profile.component';
import {MyAppsComponent} from './my-apps/my-apps.component';
import { AuthGuard } from '../../_guards/auth.guard';

const routes: Routes = [
  {path: 'profile', component: MyProfileComponent, canActivate: [AuthGuard]},
  {path: 'apps', component: MyAppsComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountManagementRoutingModule { }
