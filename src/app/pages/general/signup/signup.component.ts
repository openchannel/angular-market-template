import {Component, OnDestroy} from '@angular/core';
import {NativeLoginService, UserRegistrationModel} from 'oc-ng-common-service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnDestroy {

  loginUrl = '/login';
  companyLogoUrl = './assets/img/company-logo-2x.png';
  termsAndConditionPageUrl = 'https://my.openchannel.io/terms-of-service';
  dataProcessingPolicyUrl = 'https://my.openchannel.io/data-processing-policy';
  forgotPasswordDoneIconPath = './assets/img/forgot-password-complete-icon.svg';
  showSignupFeedbackPage = false;
  inProcess = false;
  signupUrl = '/signup';
  signupModel: UserRegistrationModel = new UserRegistrationModel();
  activationUrl = '/activate';

  private destroy$: Subject<void> = new Subject();

  constructor(private nativeLoginService: NativeLoginService) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSignup(event) {
    if (event === true) {
      this.inProcess = true;
      this.nativeLoginService.signup(this.signupModel)
        .pipe(takeUntil(this.destroy$))
        .subscribe(res => {
        this.inProcess = false;
        this.showSignupFeedbackPage = true;
      }, res => {
        this.inProcess = false;
      });
    }
  }
}
