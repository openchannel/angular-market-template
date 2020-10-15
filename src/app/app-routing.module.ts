import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonLayoutComponent} from './layouts/common-layout/common-layout.component';
import {AppStoreComponent} from './components/applications/app-store/app-store.component';
import {AppDetailComponent} from './components/applications/app-detail/app-detail.component';
import {AppDeveloperComponent} from './components/applications/app-developer/app-developer.component';
import {AppAppsComponent} from './components/applications/app-apps/app-apps.component';
import {AppNewComponent} from './components/applications/app-new/app-new.component';
import {MyProfileComponent} from './components/my-profile/my-profile.component';
import {EditAppComponent} from './components/applications/edit-app/edit-app.component';

const routes: Routes = [
  {
    path: '',
    component: CommonLayoutComponent,

    children: [
      {path: 'app-store', component: AppStoreComponent},
      {path: 'app-detail', component: AppDetailComponent},
      {path: 'app-developer', component: AppDeveloperComponent},
      {path: 'app-list', component: AppAppsComponent},
      {path: 'app-new', component: AppNewComponent},
      {path: 'my-profile', component: MyProfileComponent},
      {path: 'edit-app/:appId/version/:versionId', component: EditAppComponent},
    ]
  },
  {path: '**', redirectTo: '/not-found'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
