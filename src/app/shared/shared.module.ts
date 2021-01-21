import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OcCommonLibModule} from 'oc-ng-common-component';
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
import {InviteUserModalComponent} from '@shared/modals/invite-user-modal/invite-user-modal.component';

@NgModule({
  declarations: [
    FormModalComponent,
    ConfirmationModalComponent,
    InviteUserModalComponent,
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
    NotificationComponent,
    CamelCaseToNormalPipe,
    FormsModule
  ]
})
export class SharedModule { }
