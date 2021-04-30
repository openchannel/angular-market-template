import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AuthenticationService,
  PropertiesService,
  UserAccountService,
  UserAccountTypesService
} from 'oc-ng-common-service';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { FormGroup } from '@angular/forms';
import {
  OCOrganization,
  OcEditUserFormConfig,
  OcEditUserResult,
} from 'oc-ng-common-component';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { OcEditUserTypeService } from '@core/services/user-type-service/user-type.service';

@Component({
  selector: 'app-general-profile',
  templateUrl: './general-profile.component.html',
  styleUrls: ['./general-profile.component.scss']
})
export class GeneralProfileComponent implements OnInit, OnDestroy {

  private readonly formConfigsWithoutTypeData: OcEditUserFormConfig [] = [
    {
      name: 'Default',
      account: {
        type: 'default',
        typeData: null,
        includeFields: ['name', 'email']
      },
      organization: null
    },
    {
      name: 'Custom',
      account: {
        type: 'custom-account-type',
        typeData: null,
        includeFields: ['name', 'username', 'email', 'customData.about-me']
      },
      organization: null
    }
  ];

  public formConfigsLoaded = false;
  public formConfigs: OcEditUserFormConfig[];
  public formAccountData: OCOrganization;
  public formEnableTypesDropdown = false;

  public inSaveProcess = false;

  public formGroup: FormGroup;
  public resultData: OcEditUserResult;

  private loader: LoadingBarState;
  private $destroy = new Subject<void>();

  private readonly CHANGE_TYPE_PROPERTY_ID = 'canchangetype';
  private readonly CHANGE_TYPE_PROPERTY_VALUE = 'true';

  constructor(private loadingBar: LoadingBarService,
              private accountService: UserAccountService,
              private accountTypeService: UserAccountTypesService,
              private authService: AuthenticationService,
              private propertiesService: PropertiesService,
              private toasterService: ToastrService,
              private ocTypeService: OcEditUserTypeService) {
  }

  ngOnInit(): void {
    this.loader = this.loadingBar.useRef();
    this.initDefaultFormConfig();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.unsubscribe();
    if (this.loader) {
      this.loader.complete();
    }
  }

  private initDefaultFormConfig(): void {
    this.loader.start();
    forkJoin({
      canChangeType: this.getCanChangeTypePermission(),
      accountData: this.accountService.getUserAccount(),
      formConfigs: this.ocTypeService.injectTypeDataIntoConfigs(
          this.formConfigsWithoutTypeData, false, true)
    }).subscribe(result => {
      this.loader.complete();
      this.formEnableTypesDropdown = result.canChangeType;
      this.formAccountData = result.accountData;
      this.formConfigs = result.formConfigs;
      this.formConfigsLoaded = true;
    }, () => this.loader.complete());
  }

  private getCanChangeTypePermission(): Observable<boolean> {
    return this.propertiesService.getProperties(
        JSON.stringify({propertyId: this.CHANGE_TYPE_PROPERTY_ID}))
    .pipe(
        map(e => e.list[0]?.value === this.CHANGE_TYPE_PROPERTY_VALUE),
        takeUntil(this.$destroy));
  }

  public saveUserData(): void {
    this.formGroup.markAllAsTouched();

    const accountData = this.resultData?.account;
    if (!this.inSaveProcess && accountData) {

      this.loader.start();
      this.inSaveProcess = true;

      this.accountService.updateUserAccount(accountData)
      .pipe(
          tap(() => this.toasterService.success('Your profile has been updated')),
          takeUntil(this.$destroy)
      ).subscribe(() => {
        this.inSaveProcess = false;
        this.loader.complete();
      }, () => {
        this.inSaveProcess = false;
        this.loader.complete();
      });
    }
  }
}
