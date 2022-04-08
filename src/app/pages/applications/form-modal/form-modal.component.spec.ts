import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormModalComponent } from './form-modal.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MockButtonComponent, MockFormComponent, MockNgbActiveModal } from '../../../../mock/mock';
import { By } from '@angular/platform-browser';
import { FormControl, FormGroup } from '@angular/forms';

describe('FormModalComponent', () => {
    let component: FormModalComponent;
    let fixture: ComponentFixture<FormModalComponent>;

    const mockedFormGroup = new FormGroup({
        mock: new FormControl(),
    });

    const getPrimaryButtonDE = () => fixture.debugElement.query(By.css('oc-button[type=primary]'));
    const getSecondaryButtonDE = () => fixture.debugElement.query(By.css('oc-button[type=secondary]'));

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FormModalComponent, MockFormComponent, MockButtonComponent],
            providers: [{ provide: NgbActiveModal, useClass: MockNgbActiveModal }],
        }).compileComponents();

        fixture = TestBed.createComponent(FormModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should inject correct values to oc-form and set correct formData', () => {
        jest.spyOn(component, 'onFormCreated');

        const getMockFormDE = () => fixture.debugElement.query(By.directive(MockFormComponent));

        const form = getMockFormDE();

        form.componentInstance.createdForm.emit(mockedFormGroup);
        component.formData = 'mock';

        fixture.detectChanges();

        expect(component.onFormCreated).toBeCalledWith(mockedFormGroup);
        expect((component as any).form).toEqual(mockedFormGroup);
        expect(form.componentInstance.formJsonData).toEqual(component.formData);
        expect(form.componentInstance.showButton).toBeFalsy();
    });

    it('secondary button should call activeModal.close method', () => {
        jest.spyOn((component as any).activeModal, 'close');

        getSecondaryButtonDE().triggerEventHandler('click', {});

        expect((component as any).activeModal.close).toBeCalled();
    });

    it('primary button should call onSubmit method with form.invalid=true', () => {
        jest.spyOn(component, 'onSubmit');
        jest.spyOn((component as any).activeModal, 'close');

        (component as any).form = mockedFormGroup;
        (component as any).form.controls.mock.setErrors({ incorrect: true });

        getPrimaryButtonDE().triggerEventHandler('click', {});

        expect(component.onSubmit).toBeCalled();
        expect((component as any).form.controls.mock.touched).toBeTruthy();
        expect((component as any).activeModal.close).not.toBeCalledWith((component as any).form.value);
    });

    it('primary button should call onSubmit method with valid form', () => {
        jest.spyOn(component, 'onSubmit');
        jest.spyOn((component as any).activeModal, 'close');

        (component as any).form = mockedFormGroup;
        (component as any).form.controls.mock.setValue('');

        getPrimaryButtonDE().triggerEventHandler('click', {});

        expect(component.onSubmit).toBeCalled();
        expect((component as any).activeModal.close).toBeCalledWith((component as any).form.value);
    });
});
