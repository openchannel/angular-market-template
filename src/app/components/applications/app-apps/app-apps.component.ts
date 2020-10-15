import {Component, OnInit} from '@angular/core';
import {GraphqlService} from '../../../graphql-client/graphql-service/graphql.service';

@Component({
    selector: 'app-apps-list',
    templateUrl: './app-apps.component.html',
    styleUrls: ['./app-apps.component.scss']
})
export class AppAppsComponent implements OnInit {

    constructor() {
    }

    tabs = [{
        text: 'Create app',
        id: 'id_create_app'
    }, {
        text: 'Apps list',
        id: 'id_apps_list'
    }];

    currentTab = this.tabs[0];

    ngOnInit(): void {
        console.log('AppAppsComponent');
    }

    changeTabType() {
        this.currentTab = this.tabs.filter(tab => tab !== this.currentTab)[0];
    }
}
