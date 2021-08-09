import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PrerenderRequestsWatcherService } from '@openchannel/angular-common-services';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent implements OnInit {
    constructor(private router: Router, private prerenderService: PrerenderRequestsWatcherService) {}

    ngOnInit(): void {
        this.prerenderService.create404MetaTag();
    }

    goToHomePage(): void {
        this.prerenderService.remove404MetaTag();
        this.router.navigate(['/']).then(() => window.scrollTo(0, 0));
    }
}
