import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthHolderService} from 'oc-ng-common-service';
import {LogOutService} from '../../../core/services/logout-service/log-out.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

    userName: string;

    constructor(public router: Router,
                private authHolderService: AuthHolderService,
                private logOut: LogOutService) {
        this.displayUserInfo();
    }

    ngOnInit(): void {
    }

    displayUserInfo() {
        this.userName = this.authHolderService.accessToken;
    }

    logout() {
        this.logOut.logOut();
    }
}
