import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MyProfileComponent} from './my-profile/my-profile.component';
import {MyAppsComponent} from './my-apps/my-apps.component';

const routes: Routes = [
  {path: 'profile', component: MyProfileComponent},
  {path: 'apps', component: MyAppsComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountManagementRoutingModule { }
