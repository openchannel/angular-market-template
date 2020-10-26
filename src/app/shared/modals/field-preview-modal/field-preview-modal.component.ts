import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FieldDefinition } from '../../../core/services/apps-services/model/apps-model';

@Component({
  selector: 'app-field-preview-modal',
  templateUrl: './field-preview-modal.component.html',
  styleUrls: ['./field-preview-modal.component.scss']
})
export class FieldPreviewModalComponent implements OnInit {

  @Input() fieldFullData: FieldDefinition;

  public dataForForm: any;
  constructor(private modal: NgbActiveModal) { }

  ngOnInit(): void {
    this.dataForForm = {
      fields: [this.fieldFullData]
    };
  }

  close(): void {
    this.modal.close();
  }
}
