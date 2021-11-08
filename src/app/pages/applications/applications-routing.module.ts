import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppSearchComponent } from './app-search/app-search.component';
import { AppDetailComponent } from './app-detail/app-detail.component';

const routes: Routes = [
    {
        path: 'browse',
        children: [
            { path: ':filterId/:valueId', component: AppSearchComponent, data: { title: 'Search apps' } },
            { path: '', component: AppSearchComponent, data: { title: 'Search apps' } },
        ],
    },
    {
        path: 'details',
        children: [
            { path: ':appId/:appVersion', component: AppDetailComponent },
            { path: ':safeName', component: AppDetailComponent },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ApplicationsRoutingModule {}
