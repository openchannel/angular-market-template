import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import {
  ChangePasswordRequest,
  UsersService
} from 'oc-ng-common-service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {

  isSaveInProcess = false;
  changePassModel: ChangePasswordRequest = {password: '', newPassword: ''};

  private subscriber: Subscription = new Subscription();

  constructor(private toasterService: ToastrService,
              private usersService: UsersService) { }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }

  changePassword(form: NgForm){
    if (!form.valid) {
      return;
    }
    this.isSaveInProcess = true;
    this.subscriber.add(this.usersService.changePassword(form.value)
      .subscribe(() => {
        for (const controlKey of Object.keys(form.form.controls)) {
          const control = form.form.controls[controlKey];
          control.reset();
          control.setErrors(null);
        }
        this.toasterService.success('Password has been updated');
      }, (err) => {
        this.isSaveInProcess = false;
      }, () => {
        this.isSaveInProcess = false;
      }));
  }
}
