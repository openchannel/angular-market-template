import {Component, OnDestroy} from '@angular/core';
import {SellerActivation, UsersService} from 'oc-ng-common-service';
import {takeUntil} from 'rxjs/operators';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-resend-activation',
  templateUrl: './resend-activation.component.html',
  styleUrls: ['./resend-activation.component.scss']
})
export class ResendActivationComponent implements OnDestroy{

  inProcess = false;
  activationModel = new SellerActivation();

  private destroy$: Subject<void> = new Subject();

  constructor(private usersService: UsersService,
              private router: Router) { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  sendActivationMail(event) {
    if (event === true) {
      this.inProcess = true;
      this.usersService.resendActivationMail(this.activationModel.email)
        .pipe(takeUntil(this.destroy$))
        .subscribe(res => {
            this.inProcess = false;
            this.router.navigate(['login']);
          },
          error => {
            this.inProcess = false;
          },
        );
    }
  }
}
