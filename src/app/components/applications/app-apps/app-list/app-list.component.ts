import {Component, OnInit} from '@angular/core';
import {GraphqlService} from '../../../../graphql-client/graphql-service/graphql.service';
import {AppItem} from './model/app-item.model';


@Component({
    selector: 'app-app-list',
    templateUrl: './app-list.component.html',
    styleUrls: ['./app-list.component.scss']
})
export class AppListComponent implements OnInit {

    constructor(private graphqlClient: GraphqlService) {
    }

    apps: AppItem[];
    filteredApps: AppItem[];

    tabs = [{
        display: 'All',
        id: 'all'
    }, {
        display: 'Pending',
        id: 'pending'
    }, {
        display: 'In Review',
        id: 'inReview'
    }, {
        display: 'Approved',
        id: 'approved'
    }, {
        display: 'Suspended',
        id: 'suspended'
    }, {
        display: 'App Types',
        id: 'appTypes'
    }];
    currentTab = this.tabs[0];

    searchText = '';

    ngOnInit(): void {
        this.getAllApps();
    }

    getAllApps(): void {
        this.apps = [];
        this.graphqlClient.getAllApps().subscribe((response: { data: { allApps: AppItem[] } }) => {
            if (response && response.data && response.data.allApps) {
                this.apps = response.data.allApps;
            } else {
                console.log('ERROR Get all apps.');
            }
        }, () => console.log('ERROR Get all apps.'));
    }

    getTotalResultMessage(): string {
        const size = this.apps.length;
        if (size === 1) {
            return `( Result : ${size} )`;
        } else if (size > 1) {
            return `( Results : ${size} )`;
        }
        return '';
    }

    getAvailableApps() {
        return this.simpleNameFilter(this.simpleTabFilter(this.apps));
    }

    simpleNameFilter(appItems: AppItem[]): AppItem[] {
        if (this.searchText) {
            const normalizedSearchText = this.searchText.trim().toLowerCase();
            if (normalizedSearchText) {
                return this.filteredApps = appItems.filter(app => app.name && app.name.toLowerCase().includes(normalizedSearchText));
            }
        }
        return appItems;
    }

    simpleTabFilter(appItems: AppItem[]) {
        return appItems.filter(app => this.currentTab.id === 'all' || this.currentTab.id === app.status);
    }

    setNewApp(tabId: string): void {
        this.searchText = null;
        this.currentTab = this.tabs.find((e) => e.id === tabId);
    }

    getBackgroundColor(appStatus: string): string {
        if (appStatus) {
            switch (appStatus) {
                case 'approved':
                    return 'back-color-green';
                case 'inReview':
                    return 'back-color-purple';
                case 'pending':
                    return 'back-color-blue';
                case 'suspended':
                    return 'back-color-yellow';
                case 'rejected':
                    return 'back-color-red';
            }
        }
        console.error('Incorrect application status!');
        return 'back-color-red';
    }

    getStatusMessage(appStatus: string): string {
        if (appStatus) {
            switch (appStatus) {
                case 'approved':
                case 'pending':
                case 'suspended':
                case 'rejected':
                    return appStatus.toUpperCase();
                case 'inReview':
                    return 'IN REVIEW';
            }
        }
        console.error('Incorrect application status!');
        return 'STATUS';
    }
}
