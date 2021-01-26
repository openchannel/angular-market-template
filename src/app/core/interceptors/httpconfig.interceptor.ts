import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthHolderService} from 'oc-ng-common-service';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {

  constructor(private authHolderService: AuthHolderService) {
  }

  public static addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (this.authHolderService.accessToken) {
      request = HttpConfigInterceptor.addToken(request, this.authHolderService.accessToken);
    }

    return next.handle(request);
  }
}
