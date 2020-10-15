import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit {

  /**
   * Main text of the modal. Confirmation text
   */
  @Input() modalText: string = '';
  /**
   * What action need to confirm
   * Will appear in modal title
   * can be, for example: 'Delete', 'Update'
   */
  @Input() action: string = '';
  /**
   * Text on the Confirm button
   * Default value: OK
   */
  @Input() buttonText: string = 'OK';
  constructor(private modalService: NgbActiveModal) { }

  ngOnInit(): void {
  }

  closeAction(action: 'success' | 'cancel') {
    this.modalService.close(action);
  }
}
