import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SellerService, SellerSignin } from 'oc-ng-common-service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['../../login/login.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  signupUrl = "/signup";
  loginUrl = "/login";
  companyLogoUrl = "./assets/img/logo-company.png";
  forgotPasswordDoneIconPath = "./assets/img/forgot-password-complete-icon.svg";
  forgotPwdPageState: boolean = true;
  signIn = new SellerSignin();
  constructor(private sellerService: SellerService,private router: Router) { }
  inProcess = false;
  ngOnInit(): void {
  }

  resetPwd(event) {
    console.log(event);
    if (event === true) {
        this.inProcess = true;
        this.sellerService.resetForgotPassword(this.signIn.email).subscribe(res => {
          this.forgotPwdPageState = false; 
          this.inProcess = false;
      },res => {
        this.inProcess = false;
      });  
    }
  }


}
