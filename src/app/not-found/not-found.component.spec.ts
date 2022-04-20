import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { NotFoundComponent } from './not-found.component';
import { PrerenderRequestsWatcherService } from '@openchannel/angular-common-services';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { MockPrerenderRequestsWatcherService } from '../../mock/services.mock';
import { MockButtonComponent, MockRoutingComponent } from '../../mock/components.mock';

describe('NotFoundComponent', () => {
    let component: NotFoundComponent;
    let fixture: ComponentFixture<NotFoundComponent>;
    let router: Router;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [NotFoundComponent, MockButtonComponent, MockRoutingComponent],
                imports: [RouterTestingModule.withRoutes([{ path: 'some-page', component: MockRoutingComponent }])],
                providers: [{ useClass: MockPrerenderRequestsWatcherService, provide: PrerenderRequestsWatcherService }],
            }).compileComponents();
            router = TestBed.inject(Router);
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(NotFoundComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should route to / when home page link clicked', fakeAsync(() => {
        router.navigate(['some-page']);
        tick();

        const homeLink = fixture.debugElement.query(By.css('.not-found__home-page-button')).nativeElement;
        homeLink.click();
        tick();

        expect(router.url).toBe('/');
    }));

    it('should set scroll to 0 0 position when going to home page', () => {
        window.scrollTo = jest.fn();

        const homeButton = fixture.debugElement.query(By.css('.not-found__home-page-button oc-button')).nativeElement;
        homeButton.click();

        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
});
