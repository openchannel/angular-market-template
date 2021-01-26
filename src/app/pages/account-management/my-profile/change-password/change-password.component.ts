import {Component, OnDestroy, OnInit} from '@angular/core';
import {ChangePasswordRequest, NativeLoginService} from 'oc-ng-common-service';
import {Subscription} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {NgForm} from '@angular/forms';
import {LoadingBarState} from '@ngx-loading-bar/core/loading-bar.state';
import {LoadingBarService} from '@ngx-loading-bar/core';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {

  isSaveInProcess = false;
  changePassModel: ChangePasswordRequest = {password: '', newPassword: ''};

  private subscriber: Subscription = new Subscription();
  private loader: LoadingBarState;

  constructor(private toasterService: ToastrService,
              private nativeLoginService: NativeLoginService,
              private loadingBar: LoadingBarService) { }

  ngOnInit(): void {
    this.loader = this.loadingBar.useRef();
    this.loader.start();
    this.loader.complete();
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }

  changePassword(form: NgForm){
    if (!this.isSaveInProcess) {
      if (!form.valid) {
        form.form.markAllAsTouched();
      } else {
        this.isSaveInProcess = true;
        this.subscriber.add(this.nativeLoginService.changePassword(form.value)
          .subscribe(() => {
            for (const controlKey of Object.keys(form.form.controls)) {
              const control = form.form.controls[controlKey];
              control.reset();
              control.setErrors(null);
            }
            this.toasterService.success('Password has been updated');
          }, () => {
            this.isSaveInProcess = false;
          }, () => {
            this.isSaveInProcess = false;
          }));
      }
    }
  }
}
