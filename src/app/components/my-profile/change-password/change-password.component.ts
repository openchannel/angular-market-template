import { Component, OnInit, Input } from '@angular/core';
import { ChnagePasswordModel, CommonService, SellerService } from 'oc-ng-common-service';
import { NotificationService } from 'src/app/shared/custom-components/notification/notification.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  
  isSaveInProcess=false;
  @Input() changePassModel : ChnagePasswordModel = new ChnagePasswordModel();

  confirmPasswordTxt:string='';
  constructor(private commonService: CommonService,
    private notificationService: NotificationService,
    private sellerService: SellerService) { }

  ngOnInit(): void {
  }

  changePassword(changePasswordform){
    if (!changePasswordform.valid) {
      changePasswordform.control.markAllAsTouched();
      try {
        this.commonService.scrollToFormInvalidField({ form: changePasswordform, adjustSize: 60 });
      } catch (error) {
        this.notificationService.showError([{ "message": "Please fill all required fields." }]);
      }
      return;
    }
    this.changePassModel.email= localStorage.getItem('email');
    this.isSaveInProcess=true;
    this.sellerService.changePassword(this.changePassModel).subscribe((res)=>{
      // this.changePassModel.password='';
      changePasswordform.resetForm();
      changePasswordform.reset();
      changePasswordform.control.controls.currentPassword.setErrors(null);
      this.notificationService.showSuccess("Password changed successfully");
    },(err)=>{
      this.isSaveInProcess=false;
    },()=>{
      this.isSaveInProcess=false;
    })
  }
}
