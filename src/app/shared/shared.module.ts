import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OcCommonLibModule, OcFormComponent} from 'oc-ng-common-component';
import {LoaderComponent} from './components/loader/loader.component';
import {FormModalComponent} from './modals/form-modal/form-modal.component';
import {ConfirmationModalComponent} from './modals/confirmation-modal/confirmation-modal.component';
import {AddFieldModalComponent} from './modals/add-field-modal/add-field-modal.component';
import {FieldPreviewModalComponent} from './modals/field-preview-modal/field-preview-modal.component';
import {FieldOptionsComponent} from './modals/add-field-modal/field-options/field-options.component';
import {CamelCaseToNormalPipe} from './pipes/camel-case-to-normal.pipe';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgSelectModule} from '@ng-select/ng-select';
import {NotificationComponent} from './components/notification/notification.component';

@NgModule({
  declarations: [
    LoaderComponent,
    FormModalComponent,
    ConfirmationModalComponent,
    AddFieldModalComponent,
    FieldPreviewModalComponent,
    FieldOptionsComponent,
    CamelCaseToNormalPipe,
    NotificationComponent,
  ],
  imports: [
    CommonModule,
    OcCommonLibModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    NgSelectModule,
  ],
  exports: [
    OcCommonLibModule,
    LoaderComponent,
    NotificationComponent,
    CamelCaseToNormalPipe,
    FormsModule
  ]
})
export class SharedModule { }
