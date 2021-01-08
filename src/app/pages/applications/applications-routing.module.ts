import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AppSearchComponent} from './app-search/app-search.component';
import {AppDetailComponent} from './app-detail/app-detail.component';
import {HomeComponent} from './home/home.component';

const routes: Routes = [
  {path: 'store', component: HomeComponent},
  {path: 'search', component: AppSearchComponent},
  {path: 'detail/:appId', component: AppDetailComponent},
  {path: 'detail/:appId/:appVersion', component: AppDetailComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicationsRoutingModule { }
