import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
    AuthenticationService,
    OCMetaTagService,
    SiteConfigService,
    TitleService
} from '@openchannel/angular-common-services';
import { first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { siteConfig } from '../assets/data/siteConfig';
import { CmsContentService } from '@core/services/cms-content-service/cms-content-service.service';
import {MarketMetaTagService} from '@core/services/meta-tag-service/meta-tag-service.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    private destroy$: Subject<void> = new Subject();
    private loader: LoadingBarState;

    constructor(
        public router: Router,
        private authenticationService: AuthenticationService,
        private siteService: SiteConfigService,
        public loadingBar: LoadingBarService,
        private titleService: TitleService,
        private metaTagService: MarketMetaTagService,
        private cmsService: CmsContentService,
    ) {
        this.loader = this.loadingBar.useRef();
    }

    ngOnInit(): void {
        this.initSiteConfig();

        // refresh JWT token if exists`
        this.loader.start();
        this.authenticationService
            .tryLoginByRefreshToken()
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                () => this.loader.stop(),
                () => this.loader.stop(),
            );

        // init csrf
        this.authenticationService.initCsrf().pipe(takeUntil(this.destroy$), first()).subscribe();
    }

    initSiteConfig(): void {
        this.cmsService
            .getContentByPaths({
                siteTitle: 'site.title',
                siteFaviconHref: 'site.favicon',
            })
            .subscribe(content => {
                const config = { ...siteConfig };
                config.title = content.siteTitle as string;
                config.favicon.href = content.siteFaviconHref as string;
                this.siteService.initSiteConfiguration(config);
            });
    }
}
