import {
    AllAppFields,
    AppFiltersResponse,
    BasicAppsPage,
    DeveloperSearchPage,
    FullAppDataResponse
} from './apps-model';
import {Observable} from 'rxjs';

export abstract class AppsServiceImpl {

    abstract getDevelopersById(developerId: string, page: number, countForPage: number): Observable<DeveloperSearchPage>;

    abstract getApps(page: number, pageSize: number): Observable<BasicAppsPage>;

    abstract getFieldsByAppType(appType: string): Observable<AllAppFields>;

    abstract getAppFilters(pageNumber: number, limit: number): Observable<AppFiltersResponse>;

    abstract getAllPublicApps(pageNumber: number, limit: number, sort: any, query: any): Observable<FullAppDataResponse>;
}
