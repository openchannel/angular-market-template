import {Injectable} from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';

import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {NotificationService} from '@shared/components/notification/notification.service';
import {Router} from '@angular/router';
import {OcErrorService} from 'oc-ng-common-component';
import {catchError, filter, map, switchMap, take} from 'rxjs/operators';
import {AuthHolderService, AuthenticationService, LoginResponse} from 'oc-ng-common-service';
import {LoaderService} from '@core/services/loader.service';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private notificationService: NotificationService, private loaderService: LoaderService,
              private router: Router, private errorService: OcErrorService, private authHolderService: AuthHolderService,
              private authenticationService: AuthenticationService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (this.authHolderService.accessToken) {
      request = this.addToken(request, this.authHolderService.accessToken);
    }

    return next.handle(request).pipe(
        map((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            this.loaderService.closeLoader(event.url);
          }
          return event;
        }),
        catchError((response: HttpErrorResponse) => {
          this.loaderService.closeLoader(response.url);

          if (response instanceof HttpErrorResponse && response.status === 401) {
            return this.handle401Error(request, next);
          } else if (response.error && response.error['validation-errors']) {
            this.handleValidationError(response.error['validation-errors']);
          } else if (response.error && response.error.code === 'VALIDATION') {
            this.handleValidationError(response.error.errors);
          }
          return throwError(response);
        }));
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handleValidationError(validationErrorList: any[]) {
    if (validationErrorList[0].field) {
      this.errorService.setServerErrorList(validationErrorList);
    } else {
      this.notificationService.showError(validationErrorList);
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
            return next.handle(this.addToken(request, response.accessToken));
          }));
    } else {
      return this.refreshTokenSubject.pipe(
          filter(token => token != null),
          take(1),
          switchMap(jwt => {
            return next.handle(this.addToken(request, jwt));
          }));
    }
  }
}
