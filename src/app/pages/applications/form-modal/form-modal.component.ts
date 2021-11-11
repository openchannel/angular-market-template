import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-form-modal',
    templateUrl: './form-modal.component.html',
    styleUrls: ['./form-modal.component.scss'],
})
export class FormModalComponent {
    /**
     * Object with all data for the form generation
     */
    @Input() formData: any;
    @Input() modalTitle: string;

    private form: FormGroup;

    constructor(private activeModal: NgbActiveModal) {}

    closeModal(): void {
        this.activeModal.close();
    }

    onFormCreated(form: FormGroup): void {
        this.form = form;
    }

    onSubmit(): void {
        if (this.form.invalid) {
            Object.keys(this.form.controls).forEach(controlName => this.form.controls[controlName].markAsTouched());
            return;
        }

        this.activeModal.close(this.form.value);
    }
}
