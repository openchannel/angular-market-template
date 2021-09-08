import { Injectable } from '@angular/core';
import { MetaTagsPageConfig, OCMetaTagService } from '@openchannel/angular-common-services';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { metaTags } from 'assets/data/siteConfig';

@Injectable({
    providedIn: 'root',
})
export class MarketMetaTagService extends OCMetaTagService {
    constructor(metaService: Meta, router: Router) {
        super(metaService, router);
    }

    getMetaTagsConfig(): MetaTagsPageConfig {
        return metaTags;
    }

    initDefaultPageDataForAllPages(): { [name: string]: any } {
        return {
            windowUrl: window.location.href,
        };
    }
}
