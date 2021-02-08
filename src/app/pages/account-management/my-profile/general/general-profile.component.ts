import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AuthenticationService,
  UserAccount,
  UserAccountService,
  UserAccountTypesService
} from 'oc-ng-common-service';
import { Subscription, throwError } from 'rxjs';
import { OcFormComponent } from 'oc-ng-common-component';
import { catchError, mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { LoadingBarService } from '@ngx-loading-bar/core';

@Component({
  selector: 'app-general-profile',
  templateUrl: './general-profile.component.html',
  styleUrls: ['./general-profile.component.scss']
})
export class GeneralProfileComponent implements OnInit, OnDestroy {

  @ViewChild('form') dynamicForm: OcFormComponent;

  myProfile: UserAccount;
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
  private loader: LoadingBarState;

  constructor(private userService: UserAccountService,
              private loadingBar: LoadingBarService,
              private userAccountTypeService: UserAccountTypesService,
              private authService: AuthenticationService,
              private router: Router,
              private toasterService: ToastrService) {
  }

  ngOnInit(): void {
    this.loader = this.loadingBar.useRef();
    this.getMyProfileDetails();
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }

  getMyProfileDetails() {
    this.loader.start();

    this.subscriber.add(this.userService.getUserAccount().subscribe(
      account => {
        this.myProfile = account;
        if (account.type) {
          this.subscriber.add(this.userAccountTypeService.getUserAccountType(account.type)
            .subscribe(definition => {
              this.formDefinition = definition;
              this.fillFormDefinitionByValue();
            }, () => {
              this.formDefinition = this.defaultFormDefinition;
              this.fillFormDefinitionByValue();
              this.loader.complete();
            }));
        } else {
          this.formDefinition = this.defaultFormDefinition;
          this.fillFormDefinitionByValue();
        }
      }, () => this.loader.complete())
    );
  }


  saveGeneralProfile() {
    if (!this.isSaveInProcess && this.dynamicForm) {
      if (this.dynamicForm.customForm.valid) {
        this.isSaveInProcess = true;

        const accountData = {
          ...this.dynamicForm.customForm.value,
          type: this.myProfile.type,
        };
        this.userService.updateUserAccount(accountData)
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
      } else {
        this.dynamicForm.customForm.markAllAsTouched();
      }
    }
  }

  private fillFormDefinitionByValue() {
    for (const field of this.formDefinition.fields) {
      field.defaultValue = this.myProfile[field.id];
    }
    this.loader.complete();
  }
}
