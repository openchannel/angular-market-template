import { Component, OnInit } from '@angular/core';
import { SocialLink } from '@openchannel/angular-common-components';
import { CmsContentService } from '@core/services/cms-content-service/cms-content-service.service';

interface FooterColumn {
    label: string;
    location: string;
    items: FooterRow[];
}

interface FooterRow {
    label: string;
    location: string;
}

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
    socialLinks: SocialLink[] = [
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

    cmsData = {
        logoImageURL: '',
        columnsDFA: [] as FooterColumn[],
    };

    currentYear: number;

    constructor(private cmsService: CmsContentService) {}

    ngOnInit(): void {
        this.initCMSData();
        this.currentYear = new Date().getFullYear();
    }

    initCMSData(): void {
        this.cmsService
            .getContentByPaths({
                logoImageURL: 'default-footer.logo',
                columnsDFA: 'default-footer.menu.items',
            })
            .subscribe(content => {
                this.cmsData.logoImageURL = content.logoImageURL as string;
                this.cmsData.columnsDFA = content.columnsDFA as FooterColumn[];
            });
    }
}
