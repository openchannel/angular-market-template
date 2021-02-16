import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OcCommonLibModule} from 'oc-ng-common-component';
import {FormModalComponent} from './modals/form-modal/form-modal.component';
import {ConfirmationModalComponent} from './modals/confirmation-modal/confirmation-modal.component';
import {CamelCaseToNormalPipe} from './pipes/camel-case-to-normal.pipe';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgSelectModule} from '@ng-select/ng-select';

@NgModule({
  declarations: [
    FormModalComponent,
    ConfirmationModalComponent,
    CamelCaseToNormalPipe,
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
    CamelCaseToNormalPipe,
    FormsModule
  ]
})
export class SharedModule { }
