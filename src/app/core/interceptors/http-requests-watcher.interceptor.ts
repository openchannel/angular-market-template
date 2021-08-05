import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { PrerenderRequestsWatcherService } from '@openchannel/angular-common-services';
import isbot from 'isbot';
import { prerenderEndpoints } from '../../../assets/data/prerenderEndpoints';

@Injectable()
export class HttpRequestsWatcherInterceptor implements HttpInterceptor {
    constructor(private requestWatcher: PrerenderRequestsWatcherService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const event = next.handle(request);
        const notForBotUrl = prerenderEndpoints.noBot.find(url => url.includes(request.url));

        if (isbot(request.headers.get('User-Agent')) && notForBotUrl) {
            console.log('bot founded', 'endpoint', notForBotUrl);
            return EMPTY;
        }

        this.requestWatcher.addHttpEvent(event);
        return event;
    }
}
