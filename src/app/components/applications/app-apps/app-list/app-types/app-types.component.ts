import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GraphqlService } from '../../../../../graphql-client/graphql-service/graphql.service';
import { Subscription } from 'rxjs';
import { MockAppsService } from '../../../../../core/services/apps-services/mock-apps-service/mock-apps-service.service';
import { AppType } from '../../../../../core/services/apps-services/model/apps-model';

export interface FormStatus {
  editable: boolean;
  existed: boolean;
}

@Component({
  selector: 'app-app-types',
  templateUrl: './app-types.component.html',
  styleUrls: ['./app-types.component.scss']
})
export class AppTypesComponent implements OnInit, OnDestroy {

  public appTypes: FormArray = new FormArray([]);
  public appTypesData: AppType [];
  // array for checking status of current form
  public formsStatus: FormStatus [] = [];
  // array of New Type App form subscriptions
  private newAppFormSubscribers: Subscription [] = [];
  // array of Created App Type forms subscriptions
  private appTypeFormSubscribers: Subscription [] = [];
  // main subscription for http requests
  private requestSubscriber: Subscription = new Subscription();
  constructor(private fb: FormBuilder,
              private graphQLService: GraphqlService,
              private mockService: MockAppsService) { }

  ngOnInit(): void {
    this.getAppTypes();
  }

  getAppTypes(): void {
    this.requestSubscriber.add(
      this.graphQLService.getAppTypes().subscribe(
        result => {
          if (result.data.getAppTypes.list && result.data.getAppTypes.list.length > 0) {
            this.appTypesData = result.data.getAppTypes.list;
            this.appTypesData.forEach((item, index) => {
              this.fillAppType(item, index);
            });
          } else {
            this.addAppType();
          }
        }
      ));
  }
  /**
   * Adding Empty form to the App type forms
   */
  addAppType(): void {
    const appForm = this.fb.group({
      label: ['', Validators.required],
      id: ['', Validators.required],
      description: [''],
      fieldDefinitions: ['']
    });
    const formStatus = {
      editable: true,
      existed: false
    };
    const oneSubscription = new Subscription();

    oneSubscription.add(appForm.get('label').valueChanges.subscribe(value => {
      let updatedValue = value;
      updatedValue = updatedValue.trim().toLowerCase().replace(/\s+/g, '-');
      appForm.get('id').setValue(updatedValue);
    }));

    this.newAppFormSubscribers.push(oneSubscription);
    this.appTypes.push(appForm);
    this.formsStatus.push(formStatus);
  }
  /**
   * Adding form with data to the App type forms
   */
  fillAppType(appTypeObj: AppType,
              index: number): void {
    const appForm = this.fb.group({
      label: [appTypeObj.label, Validators.required],
      id: [appTypeObj.id, Validators.required],
      description: [appTypeObj.description],
      fieldDefinitions: [appTypeObj.fieldDefinitions]
    });
    const formStatus = {
      editable: false,
      existed: true
    };
    const formSubscription = new Subscription();

    appForm.get('id').disable({onlySelf: true});

    formSubscription.add(appForm.valueChanges.subscribe(changes => {
      if (!this.formsStatus[index].editable) {
        this.formsStatus[index].editable = true;
      }
    }));

    this.appTypeFormSubscribers.push(formSubscription);
    this.appTypes.push(appForm);
    this.formsStatus.push(formStatus);
  }
  /**
   * Removes not submitted App Type form
   */
  cancelForm(index: number) {
    if (index > 0) {
      this.appTypes.removeAt(index);
      this.formsStatus.slice(index, 1);
      this.newAppFormSubscribers[index].unsubscribe();
    }
  }
  /**
   * Resets the form data
   */
  resetForm(index: number, form: AbstractControl) {
    form.get('label').setValue(this.appTypesData[index].label);
    form.get('description').setValue(this.appTypesData[index].description);
    this.formsStatus[index].editable = false;
  }

  saveAppTypeData(appTypeForm: any, index?: number) {
    const appData = appTypeForm.getRawValue();
    this.graphQLService.updateAppType(appData.id, appData).subscribe(
      result => {
        if (index) {
          this.formsStatus[index].editable = false;
        }
      }
    );
  }

  catchFieldChanging(fieldsDefinitions, appTypeForm) {
    appTypeForm.get('fieldDefinitions').setValue(fieldsDefinitions);
    this.saveAppTypeData(appTypeForm);
  }

  ngOnDestroy() {
    this.appTypeFormSubscribers.forEach(subscriber => subscriber.unsubscribe());
    this.newAppFormSubscribers.forEach(subscriber => subscriber.unsubscribe());
  }
}
