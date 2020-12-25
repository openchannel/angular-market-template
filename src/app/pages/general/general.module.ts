import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralRoutingModule } from './general-routing.module';
import {SignupComponent} from './signup/signup.component';
import {LoginComponent} from './login/login.component';
import {ResendActivationComponent} from './resend-activation/resend-activation.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import {ActivationComponent} from './activation/activation.component';
import {SharedModule} from '../../shared/shared.module';


@NgModule({
  declarations: [
    SignupComponent,
    LoginComponent,
    ActivationComponent,
    ResendActivationComponent,
    ResetPasswordComponent,
    ForgotPasswordComponent,
  ],
  imports: [
    CommonModule,
    GeneralRoutingModule,
    SharedModule,
  ]
})
export class GeneralModule { }
