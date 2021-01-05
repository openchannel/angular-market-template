import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/app/store', pathMatch: 'full' },
  { path: '', loadChildren: () => import('./pages/general/general.module').then(m => m.GeneralModule) },
  { path: '', loadChildren: () => import('./pages/common-layout.module').then(m => m.CommonLayoutModule) },
  { path: '**', redirectTo: '/not-found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    onSameUrlNavigation: 'reload',
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
