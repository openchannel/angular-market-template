import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthHolderService} from 'oc-ng-common-service';
import {LogOutService} from '@core/services/logout-service/log-out.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

    userName: string;
    isSSO: any;

    constructor(public router: Router,
                public authHolderService: AuthHolderService,
                private logOut: LogOutService) {
        this.displayUserInfo();
    }

    ngOnInit(): void {
        this.isSSO = this.authHolderService?.userDetails?.isSSO;
    }

    displayUserInfo() {
        this.userName = this.authHolderService.accessToken;
    }

    get initials(): string {
        return this.authHolderService.userDetails ? this.authHolderService.getUserName().split(' ').map(value => value.substring(0, 1)).join('') : '';
    }

    logout() {
        this.logOut.logOut();
    }
}
