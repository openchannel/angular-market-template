import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AuthenticationService,
  CommonService,
  DeveloperDetailsModel,
  UserAccount,
  UserAccountService,
  UserAccountTypesService
} from 'oc-ng-common-service';
import { Subscription, throwError } from 'rxjs';
import { OcFormComponent } from 'oc-ng-common-component';
import { catchError, mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from '@core/services/loader.service';

@Component({
  selector: 'app-general-profile',
  templateUrl: './general-profile.component.html',
  styleUrls: ['./general-profile.component.scss']
})
export class GeneralProfileComponent implements OnInit {

  @ViewChild('form') dynamicForm: OcFormComponent;

  myProfile: UserAccount;
  developerDetails = new DeveloperDetailsModel();
  isSaveInProcess = false;
  formDefinition: any;
  defaultFormDefinition = {
    fields: [{
      id: 'name',
      label: 'Name',
      type: 'text',
      attributes: {required: true},
    }, {
      id: 'email',
      label: 'Email',
      type: 'emailAddress',
      attributes: {required: true},
    }],
  };

  private subscriber: Subscription = new Subscription();

  constructor(private userService: UserAccountService,
              private commonService: CommonService,
              private loaderService: LoaderService,
              private userAccountTypeService: UserAccountTypesService,
              private authService: AuthenticationService,
              private router: Router,
              private toasterService: ToastrService) {
  }

  ngOnInit(): void {
    this.getMyProfileDetails();
  }

  getMyProfileDetails() {
    this.loaderService.showLoader('myProfile');

    this.subscriber.add(this.userService.getUserAccount().subscribe(
      account => {
        this.myProfile = account;
        if (account.type) {
          this.subscriber.add(this.userAccountTypeService.getUserAccountType(account.type)
            .subscribe(definition => {
              this.formDefinition = definition;
            }));
        } else {
          this.formDefinition = this.defaultFormDefinition;
        }
        this.fillFormDefinitionByValue();
      }
    ));
  }


  saveGeneralProfile() {
    this.isSaveInProcess = true;

    this.userService.updateUserAccount(this.dynamicForm.customForm.value)
      .pipe(
        mergeMap(value => this.authService.refreshTokenSilent().pipe(
          catchError(err => {
            this.router.navigate(['login']);
            return throwError(err);
          }))))
      .subscribe(value => {
        this.toasterService.success('Your profile has been updated');
        this.isSaveInProcess = false;
      }, () => {
        this.isSaveInProcess = false;
      });
  }

  private fillFormDefinitionByValue() {
    for (const field of this.formDefinition.fields) {
      field.defaultValue = this.myProfile[field.id];
    }
    this.loaderService.closeLoader('myProfile');
  }
}
