import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService, AuthHolderService} from 'oc-ng-common-service';
import {LogOutService} from '@core/services/logout-service/log-out.service';
import {map, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {

  isSSO: any;
  isSsoConfigExist = true;

  private destroy$: Subject<void> = new Subject();

  constructor(public router: Router,
              public authHolderService: AuthHolderService,
              private openIdAuthService: AuthenticationService,
              private logOut: LogOutService) {
  }

  ngOnInit(): void {
    this.isSSO = this.authHolderService?.userDetails?.isSSO;

    console.log(this.authHolderService.isLoggedInUser());

    this.openIdAuthService.getAuthConfig()
      .pipe(
        takeUntil(this.destroy$),
        map(value => !!value))
      .subscribe((authConfigExistence) => this.isSsoConfigExist = authConfigExistence);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  login() {
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.routerState.snapshot.url }});
  }

  get initials(): string {
    return this.authHolderService.userDetails ?
      this.authHolderService.getUserName().split(' ').map(value => value.substring(0, 1)).join('') : '';
  }

  logout() {
    this.logOut.logOut();
  }
}
