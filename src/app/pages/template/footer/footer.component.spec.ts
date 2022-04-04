import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FooterComponent } from './footer.component';
import { MockCmsContentService, MockSocialLinks } from '../../../../mock/mock';
import { CmsContentService } from '@core/services/cms-content-service/cms-content-service.service';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { get } from 'lodash';

describe.skip('FooterComponent', () => {
    let component: FooterComponent;
    let fixture: ComponentFixture<FooterComponent>;

    const getSocialLinksDE = () => fixture.debugElement.query(By.directive(MockSocialLinks));

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [FooterComponent, MockSocialLinks],
                imports: [RouterTestingModule],
                providers: [{ provide: CmsContentService, useClass: MockCmsContentService }],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        jest.resetAllMocks();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FooterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call initCMSData method in ngOnInit hook', () => {
        jest.spyOn(component as any, 'initCMSData');

        // tslint:disable-next-line:no-lifecycle-call
        component.ngOnInit();

        expect((component as any).initCMSData).toHaveBeenCalled();
    });

    it('should set correct cmsData in initCMSData', () => {
        const namePathMap = {
            logoImageURL: 'default-footer.logo',
            columnsDFA: 'default-footer.menu.items',
        };

        component.cmsData = {
            logoImageURL: '',
            columnsDFA: [],
        };

        component.initCMSData();

        Object.entries(namePathMap).forEach(([name, path]) => {
            expect(component.cmsData[name]).toBe(get(MockCmsContentService.CMS_DATA, path));
        });
    });

    it('should pass all necessary variables to the oc-social-links', () => {
        const socialLinksBindingsComponentPropsMap = {
            socialLinks: 'socialLinks',
        };

        const socialLinksInstance = getSocialLinksDE().componentInstance;

        Object.values(socialLinksBindingsComponentPropsMap).forEach(([binding, propName]) => {
            expect(socialLinksInstance[binding]).toEqual(component[propName]);
        });
    });
});
