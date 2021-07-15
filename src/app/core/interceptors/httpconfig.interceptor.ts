import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthHolderService} from '@openchannel/angular-common-services';
import { OC_API_URL } from 'app/app.module';

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

    if (this.authHolderService.accessToken && request.url.startsWith(OC_API_URL)) {
      request = HttpConfigInterceptor.addToken(request, this.authHolderService.accessToken);
    }

        return next.handle(request);
    }
}
