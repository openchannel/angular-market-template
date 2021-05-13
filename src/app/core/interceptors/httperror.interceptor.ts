import {Injectable} from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';

import {Observable, Subject, throwError} from 'rxjs';
import {Router} from '@angular/router';
import {OcErrorService} from '@openchannel/angular-common-components';
import {catchError, switchMap, take} from 'rxjs/operators';
import {AuthenticationService, AuthHolderService, LoginResponse} from '@openchannel/angular-common-services';
import {ToastrService} from 'ngx-toastr';
import {HttpConfigInterceptor} from './httpconfig.interceptor';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: Subject<string> = new Subject<string>();

  constructor(private router: Router,
              private errorService: OcErrorService,
              private authHolderService: AuthHolderService,
              private authenticationService: AuthenticationService,
              private toasterService: ToastrService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const errorHeader = request.headers.get('x-handle-error');
    const notHandledErrors = errorHeader ? errorHeader.split(',').map(Number) : [];

    return next.handle(request.clone({
      headers: request.headers.delete('x-handle-error'),
    }))
    .pipe(catchError((response: HttpErrorResponse) => {
      if (response instanceof HttpErrorResponse && response.status === 401 && !response.url.includes('refresh')) {
        return this.handle401Error(request, next);
      } else if (response.error && response.error['validation-errors']) {
        this.handleValidationError(response.error['validation-errors']);
      } else if (response?.error?.errors?.length >= 1 && response?.error?.errors[0]?.field) {
        this.handleValidationError(response.error.errors);
      } else if (this.isCsrfError(response)) {
        return throwError(response);
      } else {
        if (!notHandledErrors.includes(response.status)) {
          this.handleError(response);
        }
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
      return this.authenticationService.refreshToken({refreshToken: this.authHolderService.refreshToken}).pipe(
          catchError(response => {
            this.authHolderService.clearTokensInStorage();
            this.router.navigate(['/login'])
            .then(() => this.isRefreshing = false);
            this.refreshTokenSubject.next(null);
            return throwError(response);
          }),
          switchMap((response: LoginResponse) => {
            this.authHolderService.persist(response.accessToken, response.refreshToken);
            this.refreshTokenSubject.next(response.accessToken);
            this.isRefreshing = false;
            return next.handle(HttpConfigInterceptor.addToken(request, response.accessToken));
          }));
    } else {
      return this.refreshTokenSubject.pipe(
          take(1),
          switchMap((jwt, e) => {
            if (jwt != null) {
              return next.handle(HttpConfigInterceptor.addToken(request, jwt));
            } else {
              return next.handle(request);
            }
          }));
    }
  }


  private handleError(error) {
    let errorMessage: string;
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error?.message) {
      // server-side error
      errorMessage = `Error Code: ${error.error.status}\nMessage: ${error.error.message}`;
    } else if (error.status === 403) {
      errorMessage = `Error Code: ${error.status}\nYou are not authorized to perform this action`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    this.toasterService.error(errorMessage);
  }

  private isCsrfError(error: HttpErrorResponse): boolean {
    return error?.status === 403 && error?.error?.toLowerCase()?.includes('csrf');
  }
}
