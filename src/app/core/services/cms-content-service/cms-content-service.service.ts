import { Injectable } from '@angular/core';
import { CMSSiteContentService, SiteContentService } from '@openchannel/angular-common-services';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class CmsContentService extends CMSSiteContentService {
    readonly defaultCMSType = 'site';
    constructor(private siteContentService: SiteContentService) {
        super();
        super.initContent();
    }

    /**
     * Getting content from openchannel API.
     */
    getContentFromAPI(): Observable<any> {
        return this.siteContentService.getAllContent(1, 1, null, `{'type':'${this.defaultCMSType}'}`).pipe(map(r => r.list[0]?.customData));
    }

    getContentDefault(): any {
        return {};
    }
}
