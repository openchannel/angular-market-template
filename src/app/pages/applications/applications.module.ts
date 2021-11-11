import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApplicationsRoutingModule } from './applications-routing.module';
import { AppDetailComponent } from './app-detail/app-detail.component';
import { AppSearchComponent } from './app-search/app-search.component';
import { SharedModule } from '@shared/shared.module';
import { FormModalComponent } from './form-modal/form-modal.component';
import { OcFormComponentsModule } from '@openchannel/angular-common-components';
import { ButtonActionComponent } from './app-detail/button-action/button-action.component';

@NgModule({
    declarations: [AppDetailComponent, AppSearchComponent, FormModalComponent, ButtonActionComponent],
    imports: [CommonModule, ApplicationsRoutingModule, SharedModule, OcFormComponentsModule],
})
export class ApplicationsModule {}
