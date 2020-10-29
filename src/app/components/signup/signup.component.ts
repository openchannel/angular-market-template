import {Component, OnInit} from '@angular/core';
import {SellerSignup, UsersService} from 'oc-ng-common-service';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  loginUrl = '/login';
  companyLogoUrl = './assets/img/logo-company.png';
  termsAndConditionPageUrl = 'https://my.openchannel.io/terms-of-service';
  dataProcessingPolicyUrl = 'https://my.openchannel.io/data-processing-policy';
  forgotPasswordDoneIconPath = './assets/img/forgot-password-complete-icon.svg';
  showSignupFeedbackPage = false;
  inProcess = false;
  signupUrl = '/signup';
  signupModel: SellerSignup;

  constructor(private usersService: UsersService) {
     this.signupModel = new SellerSignup();
  }

  ngOnInit(): void {
  }

  signup(event) {
    if (event === true) {
      this.inProcess = true;
      this.usersService.signup(this.signupModel).subscribe(res => {
        this.inProcess = false;
        this.showSignupFeedbackPage = true;
      }, res => {
        this.inProcess = false;
      });
    }
  }
}
