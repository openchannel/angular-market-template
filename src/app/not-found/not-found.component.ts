import { Component, OnInit } from '@angular/core';
import { PrerenderRequestsWatcherService } from '@openchannel/angular-common-services';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent implements OnInit {
    constructor(private prerenderService: PrerenderRequestsWatcherService) {}

    ngOnInit(): void {
        this.prerenderService.setPrerenderStatus(false);
        this.prerenderService.create404MetaTag();
    }

    goToHomePage(): void {
        this.prerenderService.remove404MetaTag();
        window.scrollTo(0, 0);
    }
}
