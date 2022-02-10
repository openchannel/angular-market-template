import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Page } from 'app/pages/account-management/my-company/my-company.component';
import { siteConfig } from 'assets/data/siteConfig';
import { PaymentsGateways } from '@openchannel/angular-common-services';

@Component({
    selector: 'app-my-profile',
    templateUrl: './my-profile.component.html',
    styleUrls: ['./my-profile.component.scss'],
})
export class MyProfileComponent implements OnInit {
    basePages: Page[] = [
        {
            pageId: 'profile-details',
            placeholder: 'Profile Details',
            routerLink: '/my-profile/profile-details',
            permissions: [],
        },
        {
            pageId: 'password',
            placeholder: 'Password',
            routerLink: '/my-profile/password',
            permissions: [],
        },
    ];
    billingPages: Page[] = [
        {
            pageId: 'billing',
            placeholder: 'Billing',
            routerLink: '/my-profile/billing',
            permissions: [],
        },
        {
            pageId: 'billing-history',
            placeholder: 'Billing history',
            routerLink: '/my-profile/billing-history',
            permissions: [],
        },
    ];
    pages: Page[] = this.getAvailablePages();
    selectedPage: Page;

    constructor(private router: Router, private location: Location) {}

    ngOnInit(): void {
        this.selectedPage = this.pages.find(page => this.router.url === page.routerLink);
    }

    getAvailablePages(): Page[] {
        return [
            ...this.basePages,
            ...(siteConfig.paymentsEnabled && siteConfig.paymentsGateway === PaymentsGateways.STRIPE ? this.billingPages : []),
        ];
    }

    gotoPage(newPage: Page): void {
        this.selectedPage = newPage;
        this.location.replaceState(newPage.routerLink);
    }

    goBack(): void {
        history.back();
    }
}
