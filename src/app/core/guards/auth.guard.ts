import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '@openchannel/angular-common-services';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { LoadingBarService } from '@ngx-loading-bar/core';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    private loader: LoadingBarState;
    constructor(private router: Router, private authService: AuthenticationService, private loadingBar: LoadingBarService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        this.loader = this.loadingBar.useRef();
        this.loader.start();
        return this.authService.tryLoginByRefreshToken().pipe(
            tap(isLogged => {
                this.loader.complete();
                if (!isLogged) {
                    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } }).then();
                }
            }),
        );
    }
}
