import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';

import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {Router} from '@angular/router';
import {OcErrorService} from 'oc-ng-common-component';
import {catchError, filter, switchMap, take} from 'rxjs/operators';
import {AuthenticationService, AuthHolderService, LoginResponse} from 'oc-ng-common-service';
import {ToastrService} from 'ngx-toastr';
import {HttpConfigInterceptor} from './httpconfig.interceptor';
import {LoaderService} from '@core/services/loader.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(private loaderService: LoaderService,
              private router: Router,
              private errorService: OcErrorService,
              private authHolderService: AuthHolderService,
              private authenticationService: AuthenticationService,
              private toasterService: ToastrService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(catchError((response: HttpErrorResponse) => {
        this.loaderService.closeLoader(response.url);

        if (response instanceof HttpErrorResponse && response.status === 401) {
          return this.handle401Error(request, next);
        } else if (response.error && response.error['validation-errors']) {
          this.handleValidationError(response.error['validation-errors']);
        } else if (response?.error?.errors?.size >= 1 && response?.error?.errors[0]?.field) {
          this.handleValidationError(response.error.errors);
        } else {
          this.handleError(response);
        }
        return throwError(response);
      }));
  }

  private handleValidationError(validationErrorList: any[]) {
    if (validationErrorList[0].field) {
      this.errorService.setServerErrorList(validationErrorList);
    }
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authenticationService.refreshToken({refreshToken: this.authHolderService.refreshToken}).pipe(
        catchError(response => {
          this.authHolderService.clearTokensInStorage();
          this.router.navigate(['/login']);
          return throwError(response);
        }),
        switchMap((response: LoginResponse) => {
          this.isRefreshing = false;
          this.authHolderService.persist(response.accessToken, response.refreshToken);
          this.refreshTokenSubject.next(response.accessToken);
          return next.handle(HttpConfigInterceptor.addToken(request, response.accessToken));
        }));
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(HttpConfigInterceptor.addToken(request, jwt));
        }));
    }
  }

  private handleError(error) {
    let errorMessage: string;
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error.message) {
      // server-side error
      errorMessage = `Error Code: ${error.error.status}\nMessage: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    this.toasterService.error(errorMessage);
  }
}
