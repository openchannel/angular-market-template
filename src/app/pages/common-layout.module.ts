import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommonLayoutRoutingModule } from './common-layout-routing.module';
import {CommonLayoutComponent} from './common-layout.component';
import {HeaderComponent} from './template/header/header.component';
import {FooterComponent} from './template/footer/footer.component';
import {SharedModule} from '@shared/shared.module';


@NgModule({
  declarations: [
    CommonLayoutComponent,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    CommonLayoutRoutingModule,
    SharedModule,
  ]
})
export class CommonLayoutModule { }
