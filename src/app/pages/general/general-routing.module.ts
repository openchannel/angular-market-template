import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { ActivationComponent } from './activation/activation.component';
import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResendActivationComponent } from './resend-activation/resend-activation.component';
import { InvitedSignupComponent } from './invited-signup/invited-signup.component';

const routes: Routes = [
    { path: 'signup', component: SignupComponent, data: { title: 'Signup' } },
    { path: 'activate', component: ActivationComponent, data: { title: 'Activate account' } },
    { path: 'login', component: LoginComponent, data: { title: 'Login' } },
    { path: 'reset-password', component: ResetPasswordComponent, data: { title: 'Reset password' } },
    { path: 'forgot-password', component: ForgotPasswordComponent, data: { title: 'Forgot password' } },
    { path: 'resend-activation', component: ResendActivationComponent, data: { title: 'Resend activation' } },
    { path: 'invite/:token', component: InvitedSignupComponent, data: { title: 'Signup' } },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GeneralRoutingModule {}
