import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService, AuthHolderService} from 'oc-ng-common-service';
import {LoaderService} from '@core/services/loader.service';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';


@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private loader: LoaderService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    this.loader.showLoader('isLogged');
    return this.authService.isLoggedUserByAccessOrRefreshToken()
    .pipe(tap(isLogged => {
      this.loader.closeLoader('isLogged');
      if (!isLogged) {
        this.router.navigate(['/login']);
      }
    }));
  }
}
