import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApplicationsRoutingModule } from './applications-routing.module';
import {AppDetailComponent} from './app-detail/app-detail.component';
import {AppSearchComponent} from './app-search/app-search.component';
import {SharedModule} from '@shared/shared.module';
import {HomeComponent} from './home/home.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';


@NgModule({
  declarations: [
    AppDetailComponent,
    AppSearchComponent,
    HomeComponent,
  ],
  imports: [
    CommonModule,
    ApplicationsRoutingModule,
    SharedModule,
    FontAwesomeModule,
  ]
})
export class ApplicationsModule { }
