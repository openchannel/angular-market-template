import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService, AuthHolderService, DropdownModel} from 'oc-ng-common-service';
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
  menuItems: DropdownModel<string> [] = [];

  private destroy$: Subject<void> = new Subject();

  constructor(public router: Router,
              public authHolderService: AuthHolderService,
              private openIdAuthService: AuthenticationService,
              private logOut: LogOutService) {
  }

  ngOnInit(): void {
    this.isSSO = this.authHolderService?.userDetails?.isSSO;

    this.openIdAuthService.getAuthConfig()
      .pipe(
        takeUntil(this.destroy$),
        map(value => !!value))
      .subscribe((authConfigExistence) => this.isSsoConfigExist = authConfigExistence);
    this.generateDropdownMenuItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  login() {
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.routerState.snapshot.url }});
  }

  generateDropdownMenuItems() {
    if (this.isSSO) {
      this.menuItems.push({
        value: '/management/profile',
        label: 'My Profile'
      });
    }
    if (this.authHolderService.userDetails.role === 'ADMIN') {
      this.menuItems.push({
        value: '/management/company',
        label: 'My Company'
      });
    }
  }

  onLogout() {
    this.logOut.logOut();
  }

  onDropdownItemChose(item: DropdownModel<string>) {
    this.router.navigate([item.value]).then();
  }
}
