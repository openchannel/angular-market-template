import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AuthHolderService,
  DeveloperModel,
  DeveloperTypeFieldModel,
  UserAccountService, UserCompanyModel,
  UsersService
} from 'oc-ng-common-service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '@core/services/loader.service';

@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss']
})
export class CompanyDetailsComponent implements OnInit, OnDestroy {

  typeFields: {
    fields: DeveloperTypeFieldModel [];
  };
  isInvalidForm = false;
  savingCompanyData = false;

  private newCustomData: any;
  private defaultDeveloperTypeFields: DeveloperTypeFieldModel [] = [{
    id: 'name',
    label: 'Company Name',
    type: 'text',
    attributes: {
      required: true
    }
  }];
  private companyData: UserCompanyModel;
  private subscriptions: Subscription = new Subscription();

  constructor(private toastService: ToastrService,
              private authHolderService: AuthHolderService,
              private userAccountService: UserAccountService,
              private usersService: UsersService,
              private loader: LoaderService) { }

  ngOnInit(): void {
    this.loader.showLoader('companyData');
    this.getCompanyDataFields();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.loader.closeLoader('companyData');
  }

  getCompanyDataFields() {
    this.subscriptions.add(this.usersService.getUserCompany().subscribe(
      company => {
        this.companyData = company;
        if(company.type) {
          this.subscriptions.add(this.usersService.getUserTypeDefinition(company.type)
          .subscribe(resultDefinition => {
            this.createFormFields(resultDefinition.fields);
          }));
        } else {
          this.createFormFields(this.defaultDeveloperTypeFields);
        }
      }
    ));
  }

  setCompanyData(newCustomData: any): void {
    this.newCustomData = newCustomData;
  }

  setIsFormInvalid(isInvalidForm: boolean): void {
    this.isInvalidForm = isInvalidForm;
  }

  saveType(): void {
    if (this.newCustomData) {
      this.savingCompanyData = true;
      this.subscriptions.add(this.usersService.updateUserCompany(this.newCustomData)
        .subscribe(() => {
          this.savingCompanyData = false;
          this.toastService.success('Your company details has been updated');
        }, error => {
          this.savingCompanyData = false;
          console.error('updateUserCompany', error);
        }));
    }
  }

  private createFormFields(fields: DeveloperTypeFieldModel[]): void {
    this.typeFields = {
      fields: this.mapTypeFields(this.companyData, fields)
    };
    this.loader.closeLoader('companyData');
  }

  private mapTypeFields(company: UserCompanyModel, fields: DeveloperTypeFieldModel[]): DeveloperTypeFieldModel [] {
    if (fields) {
      const defaultValues = this.getDefaultValues(company);
      return fields.filter(field => field?.id).map(field => this.mapField(field, defaultValues));
    }
    return [];
  }

  private getDefaultValues(developer: DeveloperModel): Map<string, any> {
    const map = new Map<string, any>();
    Object.entries(developer?.customData ? developer.customData : {})
      .forEach(([key, value]) => map.set(`customData.${key}`, value));
    map.set('name', developer.name);
    return map;
  }

  private mapField(field: DeveloperTypeFieldModel, defaultValues: Map<string, any>): DeveloperTypeFieldModel {
    if (field) {
      // map options
      if (field?.options) {
        field.options = this.mapOptions(field);
      }
      if (defaultValues.has(field?.id)) {
        field.defaultValue = defaultValues.get(field?.id);
      }
      // map other fields
      if (field?.fields) {
        field.fields.forEach(child => this.mapField(child, defaultValues));
        field.subFieldDefinitions = field.fields;
        field.fields = null;
      }
    }
    return field;
  }

  private mapOptions(appTypeFiled: DeveloperTypeFieldModel): string [] {
    const newOptions = [];
    appTypeFiled.options.forEach(o => newOptions.push(o?.value ? o.value : o));
    return newOptions;
  }
}
