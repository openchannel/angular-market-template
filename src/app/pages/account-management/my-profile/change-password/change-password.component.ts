import {Component, OnDestroy, OnInit} from '@angular/core';
import {NativeLoginService} from '@openchannel/angular-common-services';
import {Subject} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {FormGroup, Validators} from '@angular/forms';
import {LoadingBarState} from '@ngx-loading-bar/core/loading-bar.state';
import {LoadingBarService} from '@ngx-loading-bar/core';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {

  isSaveInProcess = false;

  formPasswordDefinition = {
    fields: [{
      id: 'password',
      label: 'Current Password',
      type: 'password',
      attributes: [],
    }, {
      id: 'newPassword',
      label: 'New Password',
      type: 'password',
      attributes: [],
    }],
  };

  public passwordFormGroup: FormGroup;

  private destroy$: Subject<void> = new Subject<void>();

  private loader: LoadingBarState;

  constructor(private toasterService: ToastrService,
              private nativeLoginService: NativeLoginService,
              private loadingBar: LoadingBarService) {
  }

  ngOnInit(): void {
    this.loader = this.loadingBar.useRef();
    this.loader.start();
    this.loader.complete();
  }

  ngOnDestroy() {
  }

  changePassword() {
    if (this.passwordFormGroup) {
      this.passwordFormGroup.markAllAsTouched();
    }
    if (this.isSaveInProcess || this.passwordFormGroup?.invalid) {
      return;
    }
    this.isSaveInProcess = true;
    this.nativeLoginService.changePassword(this.passwordFormGroup.value)
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      for (const controlKey of Object.keys(this.passwordFormGroup.controls)) {
        const control = this.passwordFormGroup.controls[controlKey];
        control.reset();
        control.setErrors(null);
      }
      this.toasterService.success('Password has been updated');
    }, () => {
      this.isSaveInProcess = false;
    }, () => {
      this.isSaveInProcess = false;
    });
  }


  setPasswordFormGroup(passwordGroup: FormGroup) {
    this.passwordFormGroup = passwordGroup;
    // clear validation for current user password
    this.passwordFormGroup.controls.password.clearValidators();
    this.passwordFormGroup.controls.password.setValidators(Validators.required);
    this.passwordFormGroup.controls.password.updateValueAndValidity();
  }
}
