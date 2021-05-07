import {Component, OnInit} from '@angular/core';
import {SocialLink} from 'oc-ng-common-component/src/lib/common-components/interfaces/social-link.model';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

    socialLinks: SocialLink[] = [
        {
            link: 'https://facebook.com',
            iconSrc: 'assets/img/facebook-icon.svg',
            iconAlt: 'facebook-icon'
        },
        {
            link: 'https://twitter.com',
            iconSrc: 'assets/img/twitter-icon.svg',
            iconAlt: 'twitter-icon'
        }
    ];

    constructor() {
    }

    ngOnInit() {
    }
}
