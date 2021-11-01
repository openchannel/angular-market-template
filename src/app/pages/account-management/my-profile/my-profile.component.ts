import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-my-profile',
    templateUrl: './my-profile.component.html',
    styleUrls: ['./my-profile.component.scss'],
})
export class MyProfileComponent implements OnInit {
    selectedPage: 'profile-details' | 'password' = 'profile-details';

    constructor(private router: Router, private location: Location) {}

    ngOnInit(): void {
        this.selectedPage = this.router.url.split('/my-profile/')[1] as 'profile-details' | 'password';
    }

    gotoPage(pagePath: 'profile-details' | 'password'): void {
        this.selectedPage = pagePath;
        this.location.replaceState('/my-profile/' + pagePath);
    }

    goBack(): void {
        history.back();
    }
}
