import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-my-profile',
    templateUrl: './my-profile.component.html',
    styleUrls: ['./my-profile.component.scss'],
})
export class MyProfileComponent implements OnInit {
    selectedPage: 'profile-details' | 'password' = 'profile-details';

    constructor(private router: Router) {}

    ngOnInit(): void {
        this.selectedPage = this.router.url.split('/')[2] as 'profile-details' | 'password';
    }

    goBack(): void {
        history.back();
    }
}
