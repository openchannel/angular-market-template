import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { FooterComponent } from './footer.component';
import { MockCmsContentService, MockSocialLinks } from '../../../../mock/mock';
import { CmsContentService } from '@core/services/cms-content-service/cms-content-service.service';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

describe('FooterComponent', () => {
    let component: FooterComponent;
    let fixture: ComponentFixture<FooterComponent>;

    const getSocialLinksDE = () => fixture.debugElement.query(By.directive(MockSocialLinks));

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FooterComponent, MockSocialLinks],
            imports: [RouterTestingModule],
            providers: [{ provide: CmsContentService, useClass: MockCmsContentService }],
        }).compileComponents();

        fixture = TestBed.createComponent(FooterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        jest.resetAllMocks();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set correct cmsData in initCMSData', fakeAsync(() => {
        component.cmsData = {
            logoImageURL: 'logo.png',
            columnsDFA: [
                {
                    label: 'label',
                    location: 'location',
                    items: [
                        {
                            label: 'label',
                            location: 'location',
                        },
                    ],
                },
            ],
        };

        component.initCMSData();

        tick();

        expect(component.cmsData.logoImageURL).toBe(MockCmsContentService.CMS_DATA['default-footer'].logo);
        expect(component.cmsData.columnsDFA).toStrictEqual(MockCmsContentService.CMS_DATA['default-footer'].menu.items);
    }));

    it('should pass all necessary variables to the oc-social-links', () => {
        component.socialLinks = [
            {
                link: 'https://facebook.com',
                iconSrc: 'assets/img/facebook-icon.svg',
                iconAlt: 'facebook-icon',
            },
            {
                link: 'https://twitter.com',
                iconSrc: 'assets/img/twitter-icon.svg',
                iconAlt: 'twitter-icon',
            },
        ];

        fixture.detectChanges();

        const socialLinksInstance = getSocialLinksDE().componentInstance;
        expect(socialLinksInstance.socialLinks).toEqual(component.socialLinks);
    });
});
