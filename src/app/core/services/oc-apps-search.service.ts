import { Injectable } from '@angular/core';
import { AppsService, AppResponse, Page } from '@openchannel/angular-common-services';
import { Observable } from 'rxjs';
import { FullAppData } from '@openchannel/angular-common-components/src/lib/common-components';
import { AppsSearchService } from '@openchannel/angular-common-components/src/lib/form-components';
import { map } from 'rxjs/operators';

@Injectable()
export class OcAppsSearchService extends AppsSearchService {
    readonly searchFields: string[] = ['name', 'appId'];

    constructor(private appsService: AppsService) {
        super();
    }

    appsSearch(existsApps: FullAppData[], searchText: string): Observable<FullAppData[]> {
        const searchAppQuery = `{'appId':{'$nin': ['${(existsApps || []).map(app => app.appId).join('\',\'')}']}}`;
        return this.appsService.searchApp(searchText, searchAppQuery, this.searchFields).pipe(map(this.mapToFullAppData));
    }

    loadDefaultApps(existsAppIDs: string[]): Observable<FullAppData[]> {
        const searchAppQuery = `{'appId':{'$in': ['${existsAppIDs.join('\',\'')}']}}`;
        return this.appsService.getApps(1, 100, null, searchAppQuery).pipe(map(this.mapToFullAppData));
    }

    private mapToFullAppData(appsPage: Page<AppResponse>): FullAppData[] {
        return appsPage.list.map(appResponse => new FullAppData(appResponse, null));
    }
}
