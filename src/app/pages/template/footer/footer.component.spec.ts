import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { FooterComponent } from './footer.component';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { MockSocialLinks } from '../../../../mock/components.mock';
import { mockCmsContentService } from '../../../../mock/providers.mock';

describe('FooterComponent', () => {
    let component: FooterComponent;
    let fixture: ComponentFixture<FooterComponent>;

    const getSocialLinksDE = () => fixture.debugElement.query(By.directive(MockSocialLinks));

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FooterComponent, MockSocialLinks],
            imports: [RouterTestingModule],
            providers: [mockCmsContentService()],
        }).compileComponents();

        fixture = TestBed.createComponent(FooterComponent);
        component = fixture.componentInstance;

        jest.resetAllMocks();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set correct cmsData in initCMSData', fakeAsync(() => {
        const mockedResult = {
            logoImageURL: 'assets/img/logo-company.png',
            columnsDFA: [
                {
                    label: '',
                    location: '',
                    items: [
                        {
                            label: '',
                            location: '',
                        },
                    ],
                },
            ],
        };

        // using .toString() because bottomInfo.textContent has string type
        const currentYear = new Date().getFullYear().toString();
        const bottomInfo: HTMLElement = fixture.nativeElement.querySelector('.bottom-info');

        jest.spyOn((component as any).cmsService, 'getContentByPaths').mockReturnValue(of(mockedResult));

        fixture.detectChanges();
        tick();

        expect(bottomInfo.textContent).toContain(currentYear);
        expect(component.cmsData.logoImageURL).toBe(mockedResult.logoImageURL);
        expect(component.cmsData.columnsDFA).toStrictEqual(mockedResult.columnsDFA);
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
