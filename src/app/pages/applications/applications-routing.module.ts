import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppSearchComponent } from './app-search/app-search.component';
import { AppDetailComponent } from './app-detail/app-detail.component';
import { siteConfig } from 'assets/data/siteConfig';
import { CheckoutComponent } from 'app/pages/applications/checkout/checkout.component';
import { AuthGuard } from '@core/guards/auth.guard';

const checkoutPage = siteConfig.paymentsEnabled
    ? [
          {
              path: 'checkout',
              children: [
                  { path: ':safeName', component: CheckoutComponent, canActivate: [AuthGuard] },
                  { path: ':appId/:appVersion', component: AppDetailComponent, canActivate: [AuthGuard] },
              ],
          },
      ]
    : [];

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
    ...checkoutPage,
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ApplicationsRoutingModule {}
