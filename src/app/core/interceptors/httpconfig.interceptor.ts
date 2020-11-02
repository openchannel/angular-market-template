import {Injectable} from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';

import {Observable, throwError} from 'rxjs';
import {NotificationService} from 'src/app/shared/custom-components/notification/notification.service';
import {LoaderService} from 'src/app/shared/services/loader.service';
import {Router} from '@angular/router';
import {OcErrorService} from 'oc-ng-common-component';
import {catchError, map} from 'rxjs/operators';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  constructor(private notificationService: NotificationService, private loaderService: LoaderService,
              private router: Router, private errorService: OcErrorService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
        map((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            this.loaderService.closeLoader(event.url);
          }
          return event;
        }),
        catchError((response: HttpErrorResponse) => {
          this.loaderService.closeLoader(response.url);

          if (response.error && response.error['validation-errors']) {
            this.handleValidationError(response.error['validation-errors']);
          }
          return throwError(response);
        }));
  }

  handleValidationError(validationErrorList: any[]) {
    if (validationErrorList[0].field) {
      this.errorService.setServerErrorList(validationErrorList);
    } else {
      this.notificationService.showError(validationErrorList);
    }
  }
}
