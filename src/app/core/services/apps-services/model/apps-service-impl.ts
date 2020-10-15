import {AllAppFields, AppField, BasicAppsPage, DeveloperSearchPage} from './apps-model';
import {Observable} from 'rxjs';

export abstract class AppsServiceImpl {

    abstract getDevelopersById(developerId: string, page: number, countForPage: number): Observable<DeveloperSearchPage>;

    abstract getApps(page: number, pageSize: number): Observable<BasicAppsPage>;

    abstract getFieldsByAppType(appType: string): Observable<AllAppFields>;
}
