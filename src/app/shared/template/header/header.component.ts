import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthHolderService} from 'oc-ng-common-service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

    userName: string;

    constructor(public router: Router,
                private authHolderService: AuthHolderService) {
        this.displayUserInfo();
    }

    ngOnInit(): void {
    }

    displayUserInfo() {
        if (localStorage.getItem('email')) {
            this.userName = localStorage.getItem('email');
        }
    }

    logout() {
        localStorage.clear();
        this.authHolderService.clearTokensInStorage();
        this.router.navigate(['/login']);
    }
}
