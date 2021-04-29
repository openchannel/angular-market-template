import {Component, OnDestroy, OnInit} from '@angular/core';
import {NativeLoginService} from 'oc-ng-common-service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {LoadingBarState} from '@ngx-loading-bar/core/loading-bar.state';
import {LoadingBarService} from '@ngx-loading-bar/core';
import {
  OcEditUserFormConfig,
  OcEditUserResult,
} from 'oc-ng-common-component/src/lib/auth-components';
import {OcEditUserTypeService} from '@core/services/user-type-service/user-type.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {

  private readonly formConfigsWithoutTypeData: OcEditUserFormConfig [] = [
    {
      name: 'Default',
      organization: {
        type: 'default',
        typeData: null,
        includeFields: ['customData.company']
      },
      account: {
        type: 'default',
        typeData: null,
        includeFields: ['name', 'email']
      }
    },
    {
      name: 'Custom',
      organization: {
        type: 'custom-user-type',
        typeData: null,
        includeFields: ['name', 'customData.about-my-company']
      },
      account: {
        type: 'custom-account-type',
        typeData: null,
        includeFields: ['name', 'username', 'email', 'customData.about-me']
      }
    }
  ];

  public loginUrl = '/login';
  public companyLogoUrl = './assets/img/company-logo-2x.png';
  public termsAndConditionPageUrl = 'https://my.openchannel.io/terms-of-service';
  public dataProcessingPolicyUrl = 'https://my.openchannel.io/data-processing-policy';
  public forgotPasswordDoneIconPath = './assets/img/forgot-password-complete-icon.svg';
  public showSignupFeedbackPage = false;
  public inProcess = false;
  public signupUrl = '/signup';
  public activationUrl = '/activate';
  public formConfigsLoading = true;
  public formConfigs: OcEditUserFormConfig[];

  private destroy$: Subject<void> = new Subject();
  private loaderBar: LoadingBarState;

  constructor(private nativeLoginService: NativeLoginService,
              private loadingBarService: LoadingBarService,
              private ocEditTypeService: OcEditUserTypeService) {
  }

  ngOnInit(): void {
    this.loaderBar = this.loadingBarService.useRef();
    this.initFormConfigs();
  }

  private initFormConfigs(): void {
    this.loaderBar.start();
    this.ocEditTypeService.injectTypeDataIntoConfigs(
        this.formConfigsWithoutTypeData, true, true)
    .pipe(
        takeUntil(this.destroy$))
    .subscribe(formConfigs => {
      this.loaderBar.complete();
      this.formConfigs = formConfigs;
      this.formConfigsLoading = false;
    }, () => {
      this.loaderBar.complete();
      this.formConfigsLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.loaderBar) {
      this.loaderBar.complete();
    }
  }

  onSignup(userData: OcEditUserResult): void {
    if (userData && !this.inProcess) {
      this.inProcess = true;
      this.nativeLoginService.signup({
        account: userData?.account,
        organization: userData?.organization,
        password: userData?.password
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.inProcess = false;
        this.showSignupFeedbackPage = true;
      }, () => this.inProcess = false);
    }
  }
}
