import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { PrerenderRequestsWatcherService } from '@openchannel/angular-common-services';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent implements AfterViewInit {
    constructor(private router: Router, private prerenderService: PrerenderRequestsWatcherService) {}

    ngAfterViewInit(): void {
        this.prerenderService.create404MetaTag();
        setTimeout(() => this.prerenderService.setPrerenderStatus(true), 1000);
    }

    goToHomePage(): void {
        this.prerenderService.remove404MetaTag();
        window.scrollTo(0, 0);
    }
}
