import { Component, OnInit } from '@angular/core';
import { SellerService,SellerResetPassword, SellerSignin } from 'oc-ng-common-service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NotificationService } from 'src/app/shared/custom-components/notification/notification.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  constructor (private sellerService : SellerService,
    private router: Router,
    private notificationService: NotificationService) { }
  companyLogoUrl = "./assets/img/logo-company.png";
  resetUrl = "/forgot-password";
  inProcess = false;

  resetModel = new SellerResetPassword();
  signInModel = new SellerSignin();
  ngOnInit(): void {
  }

  reset(event){
    if (event === true) {
       this.inProcess = true;
       this.sellerService.resetNewPassword(this.resetModel).subscribe(res => {
       this.inProcess = false;
       this.notificationService.showSuccess('Password reset successfully.');
       var signInModel  = new SellerSignin();
        signInModel.email = this.resetModel.email;
        signInModel.password = this.resetModel.newPassword;
        signInModel.grant_type = 'password';
        signInModel.clientId = environment.client_id;
        signInModel.clientSecret = environment.client_secret;
        this.inProcess = true;

       },
        error => {
          this.inProcess = false;
        }
       );
    }
  }

}
