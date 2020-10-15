import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from '../../../../../../shared/modals/confirmation-modal/confirmation-modal.component';
import { AddFieldModalComponent } from '../../../../../../shared/modals/add-field-modal/add-field-modal.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FieldPreviewModalComponent } from '../../../../../../shared/modals/field-preview-modal/field-preview-modal.component';

@Component({
  selector: 'app-app-type-fields',
  templateUrl: './app-type-fields.component.html',
  styleUrls: ['./app-type-fields.component.scss']
})
export class AppTypeFieldsComponent implements OnInit {

  /** App fields input data */
  @Input() fieldDefinitions = [];
  /** Sending fields data to the parent */
  @Output() fieldsChanging = new EventEmitter<any>();

  public newFieldDefinitions = [];
  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
    this.newFieldDefinitions = this.fieldDefinitions;
  }

  deleteField(index: number): void {
    const modalRef = this.modalService.open(ConfirmationModalComponent);

    modalRef.componentInstance.modalText = 'Are you sure you want to delete '
      + this.newFieldDefinitions[index].label + ' field?';
    modalRef.componentInstance.action = 'Delete';
    modalRef.componentInstance.buttonText = 'DELETE';

    modalRef.result.then(result => {
      if (result === 'success') {
        this.newFieldDefinitions = this.newFieldDefinitions.splice(index, 1);
        this.fieldsChanging.emit(this.newFieldDefinitions);
      }
    });
  }

  editField(fullFieldData?: any, index?: number): void {
    const modalRef = this.modalService.open(AddFieldModalComponent, { size: 'lg' });

    if (fullFieldData) {
      modalRef.componentInstance.fieldData = fullFieldData;
      modalRef.componentInstance.action = 'Edit';
    } else {
      modalRef.componentInstance.action = 'Add';
    }

    modalRef.result.then(result => {
      if (result.status === 'success') {
        if (index) {
          this.newFieldDefinitions = this.newFieldDefinitions.splice(index, 1, result.fieldData);
        } else {
          this.newFieldDefinitions = [...this.newFieldDefinitions, result.fieldData];
        }
        this.fieldsChanging.emit(this.newFieldDefinitions);
      }
    });
  }

  previewField(fullFieldData): void {
    const modalRef = this.modalService.open(FieldPreviewModalComponent, { size: 'lg' });
    modalRef.componentInstance.fieldFullData = fullFieldData;
  }

  itemDropped(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.newFieldDefinitions, event.previousIndex, event.currentIndex);
    this.fieldsChanging.emit(this.newFieldDefinitions);
  }
}
