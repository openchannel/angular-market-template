import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-confirmation-modal',
    templateUrl: './confirmation-modal.component.html',
    styleUrls: ['./confirmation-modal.component.scss'],
})
export class ConfirmationModalComponent {
    /** Title at the top of the modal */
    @Input() modalTitle: string = '';
    /**
     * Main text of the modal. Confirmation text
     */
    @Input() modalText: string = '';
    /**
     * Text on the Confirm button
     * Default value: OK
     */
    @Input() buttonText: string = 'OK';
    /**
     * Show or hide cancel button
     * Default: true
     */
    @Input() showCancel: boolean = true;
    /**
     * Custom text for the Cancel button
     */
    @Input() cancelButtonText: string = 'No, cancel';
    /**
     * Confirm button type.
     */
    _buttonType = 'btn-primary';
    @Input() set buttonType(type: 'danger' | 'primary') {
        if (type) {
            this._buttonType = `btn-${type}`;
        }
    }

    constructor(private modalService: NgbActiveModal) {}

    closeAction(result: boolean) {
        this.modalService.close(result);
    }
}
