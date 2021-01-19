import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AppSearchComponent} from './app-search/app-search.component';
import {AppDetailComponent} from './app-detail/app-detail.component';

const routes: Routes = [
  {path: 'search', component: AppSearchComponent, data: {title: 'Search apps'}},
  {path: 'detail/:appId', component: AppDetailComponent},
  {path: 'detail/:appId/:appVersion', component: AppDetailComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicationsRoutingModule { }
