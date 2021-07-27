import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomHttpClientXsrfModule, OcCommonServiceModule } from '@openchannel/angular-common-services';
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

function getApiUrl(): string {
    if (environment.enableProxy) {
        return `${window.origin}/client-api/`;
    }
    return environment.apiUrl;
}

export const OC_API_URL = getApiUrl();

@NgModule({
    declarations: [AppComponent, HomeComponent, NotFoundComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        HttpClientModule,
        AppRoutingModule,
        BrowserModule,
        BrowserAnimationsModule,
        OcCommonServiceModule.forRoot(OC_API_URL),
        DragDropModule,
        ToastrModule.forRoot(),
        OAuthModule.forRoot(),
        CustomHttpClientXsrfModule.withOptions({ headerName: 'X-CSRF-TOKEN', apiUrl: OC_API_URL }),
        SharedModule,
        OcAppCategoriesModule,
        LoadingBarModule,
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
        { provide: FileUploaderService, useClass: FileService },
    ],
    bootstrap: [AppComponent],
    entryComponents: [],
})
export class AppModule {}
