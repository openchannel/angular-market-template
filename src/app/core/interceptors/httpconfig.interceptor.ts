import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthHolderService } from '@openchannel/angular-common-services';

export class HttpConfigInterceptor implements HttpInterceptor {
    constructor(private authHolderService: AuthHolderService, private apiURL: string) {}

    static addToken(request: HttpRequest<any>, token: string) {
        return request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.authHolderService.accessToken && request.url.startsWith(this.apiURL)) {
            request = HttpConfigInterceptor.addToken(request, this.authHolderService.accessToken);
        }

        return next.handle(request);
    }
}
