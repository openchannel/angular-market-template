import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
    CustomHttpClientXsrfModule,
    OcCommonServiceModule,
    NetlifyPrerenderModule,
    AuthHolderService,
} from '@openchannel/angular-common-services';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OAuthModule } from 'angular-oauth2-oidc';
import { ToastrModule } from 'ngx-toastr';
import { HttpConfigInterceptor } from '@core/interceptors/httpconfig.interceptor';
import { environment } from '@env';
import { SharedModule } from '@shared/shared.module';
import { HomeComponent } from './home/home.component';
import { HttpErrorInterceptor } from '@core/interceptors/httperror.interceptor';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { NotFoundComponent } from './not-found/not-found.component';
import { OcAppCategoriesModule, FileUploaderService } from '@openchannel/angular-common-components';
import { FileService } from '@core/services/file.service';
import { OcAppsSearchService } from '@core/services/oc-apps-search.service';
import { AppsSearchService } from '@openchannel/angular-common-components/src/lib/form-components';
import { prerenderEndpoints } from '../assets/data/prerenderEndpoints';

const apiURl = environment.enableProxy ? `${window.origin}/client-api/` : environment.apiUrl;

@NgModule({
    declarations: [AppComponent, HomeComponent, NotFoundComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        HttpClientModule,
        AppRoutingModule,
        BrowserModule,
        BrowserAnimationsModule,
        OcCommonServiceModule.forRoot(apiURl),
        DragDropModule,
        ToastrModule.forRoot(),
        OAuthModule.forRoot(),
        CustomHttpClientXsrfModule.withOptions({ headerName: 'X-CSRF-TOKEN', apiUrl: apiURl }),
        NetlifyPrerenderModule.withOptions({ endpointsConfigForPrerender: prerenderEndpoints }),
        SharedModule,
        OcAppCategoriesModule,
        LoadingBarModule,
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useFactory: (authHolderService: AuthHolderService): HttpConfigInterceptor => new HttpConfigInterceptor(authHolderService, apiURl),
            deps: [AuthHolderService],
            multi: true,
        },
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
        { provide: FileUploaderService, useClass: FileService },
        { provide: AppsSearchService, useClass: OcAppsSearchService },
    ],
    bootstrap: [AppComponent],
    entryComponents: [],
})
export class AppModule {}
