import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonLayoutComponent} from './common-layout.component';

const routes: Routes = [
  {
    path: '',
    component: CommonLayoutComponent,
    children: [
      { path: 'app', loadChildren: () => import('./applications/applications.module').then(m => m.ApplicationsModule) },
      { path: 'management', loadChildren: () => import('./account-management/account-management.module').then(m => m.AccountManagementModule) },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommonLayoutRoutingModule {
}
