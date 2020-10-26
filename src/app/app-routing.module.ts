import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonLayoutComponent} from './layouts/common-layout/common-layout.component';
import {AppDetailComponent} from './components/applications/app-detail/app-detail.component';
import {MyProfileComponent} from './components/my-profile/my-profile.component';
import {AppSearchComponent} from './components/applications/app-search/app-search.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: CommonLayoutComponent,

    children: [
      {path: '', component: HomeComponent},
      {path: 'app-store', component: HomeComponent},
      {path: 'app-search', component: AppSearchComponent},
      {path: 'app-detail/:appId', component: AppDetailComponent},
      {path: 'my-profile', component: MyProfileComponent},
    ]
  },
  {path: '**', redirectTo: '/not-found'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true,
    onSameUrlNavigation: 'reload',
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
