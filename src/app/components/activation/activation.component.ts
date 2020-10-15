import { Component, OnInit } from '@angular/core';
import { SellerActivation, SellerService, SellerSignin, OauthService, AuthenticationService } from 'oc-ng-common-service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/shared/custom-components/notification/notification.service';

@Component({
  selector: 'app-activation',
  templateUrl: './activation.component.html',
  styleUrls: ['./activation.component.scss']
})
export class ActivationComponent implements OnInit {

  constructor(private sellerService : SellerService,private oauthService: OauthService,private authenticationService: AuthenticationService,private router: Router,private notificationService: NotificationService) { }
  companyLogoUrl = "./assets/img/logo-company.png";
  signupUrl = "/signup";
  activationUrl = "";
  inProcess = false;

  activationModel = new SellerActivation();
  signInModel = new SellerSignin();
  ngOnInit(): void {
  }

  activate(event){
    if (event===true) {
       this.inProcess = true;
       this.sellerService.emailVerification(this.activationModel).subscribe(res => {
       this.inProcess = false;
       this.notificationService.showSuccess('Account activated successfully.');
       var signInModel  = new SellerSignin();
        signInModel.email = this.activationModel.email;
        signInModel.password = this.activationModel.password;
        signInModel.grant_type = 'password';
        signInModel.clientId = environment.client_id;
        signInModel.clientSecret = environment.client_secret;      
        this.inProcess = true;
        this.oauthService.signIn(signInModel).subscribe( (res) => {
          this.authenticationService.saveUserAfterLoginSuccess(res,signInModel);
          this.authenticationService.saveUserprofileInformation(()=>{  
            this.router.navigateByUrl("/app-developer");          
            this.inProcess = false;
          }
        );
          
        });
       },
        error => {
          this.inProcess = false;
        } 
       );
    }  
    
  }

}
