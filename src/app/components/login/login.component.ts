import { Component, OnInit } from '@angular/core';
import { OauthService, SellerSignin, SellerService, AuthenticationService } from 'oc-ng-common-service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { LoaderService } from 'src/app/shared/services/loader.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  companyLogoUrl = "./assets/img/logo-company.png";
  signupUrl = "/signup";
  forgotPwdUrl = "/forgot-password";
  successLoginFwdUrl = "/app-developer";
  signIn = new SellerSignin();
  inProcess = false;
  isLoading = true;
  constructor(private oauthService : OauthService,private router: Router,private sellerService : SellerService,
    private authenticationService : AuthenticationService, private loaderService : LoaderService
  ) { }

  ngOnInit(): void {
    this.loaderService.showLoader("1");
      //localStorage.getItem("rememberMe") && localStorage.getItem("rememberMe")=='true' &&
      if (localStorage.getItem("access_token")) {
        this.authenticationService.saveUserprofileInformation(res => {
            this.isLoading = false;
            this.loaderService.closeLoader("1");
            this.router.navigateByUrl("/app-developer");
        },res => {
          this.isLoading = false;
          this.loaderService.closeLoader("1");
        });
      }else{
        this.isLoading = false;
        this.loaderService.closeLoader("1");
      }
  }

  login(event) {
    this.router.navigateByUrl("/app-store");
  }

}
