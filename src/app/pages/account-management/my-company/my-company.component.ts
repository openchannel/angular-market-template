import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import {
    AccessLevel,
    AuthHolderService,
    InviteUserService,
    Permission,
    PermissionType,
    UserRoleService,
    UsersService,
} from '@openchannel/angular-common-services';
import { ModalInviteUserModel, OcInviteModalComponent } from '@openchannel/angular-common-components';
import { ManagementComponent } from './management/management.component';
import { Location } from '@angular/common';
import { map, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';

export interface Page {
    pageId: string;
    placeholder: string;
    routerLink: string;
    permissions: Permission[];
}

@Component({
    selector: 'app-my-company',
    templateUrl: './my-company.component.html',
    styleUrls: ['./my-company.component.scss'],
})
export class MyCompanyComponent implements OnInit, OnDestroy {
    @ViewChild('appManagement') appManagement: ManagementComponent;

    pages: Page[] = [
        {
            pageId: 'company',
            placeholder: 'Company details',
            routerLink: '/my-company/company-details',
            permissions: [
                {
                    type: PermissionType.ORGANIZATIONS,
                    access: [AccessLevel.MODIFY, AccessLevel.READ],
                },
            ],
        },
        {
            pageId: 'profile',
            placeholder: 'User management',
            routerLink: '/my-company/user-management',
            permissions: [
                {
                    type: PermissionType.ACCOUNTS,
                    access: [AccessLevel.MODIFY, AccessLevel.READ],
                },
            ],
        },
    ];

    currentPages: Page[] = [];
    selectedPage: Page;

    isProcessing = false;

    isSSO: boolean;

    private companyName$ = new BehaviorSubject<string>(null);
    private destroy$: Subject<void> = new Subject();

    constructor(
        private modal: NgbModal,
        private toaster: ToastrService,
        private authHolderService: AuthHolderService,
        private userRolesService: UserRoleService,
        private userService: UsersService,
        private inviteService: InviteUserService,
        private router: Router,
        private location: Location,
    ) {}

    ngOnInit(): void {
        this.isSSO = this.authHolderService?.userDetails?.isSSO;

        this.currentPages = this.filterPagesByUserType();
        this.initMainPage();
        this.initCompanyName();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.companyName$.complete();
    }

    gotoPage(newPage: Page): void {
        this.selectedPage = newPage;
        this.location.replaceState(newPage.routerLink);
    }

    goBack(): void {
        history.back();
    }

    openInviteModal(): void {
        this.companyName$.subscribe(companyName => {
            const modalRef = this.modal.open(OcInviteModalComponent, { size: 'sm' });
            modalRef.componentInstance.ngbModalRef = modalRef;

            const modalData = new ModalInviteUserModel();
            modalData.modalTitle = 'Invite a member';
            modalData.successButtonText = 'Send Invite';

            modalData.requestFindUserRoles = () => {
                return this.userRolesService.getUserRoles(1, 100);
            };

            modalData.requestSendInvite = (accountData: any) => {
                return this.inviteService.sendUserInvite(companyName, accountData);
            };

            modalRef.componentInstance.modalData = modalData;

            modalRef.result.then(
                () => {
                    this.toaster.success('Invitation sent');
                    this.appManagement.getAllUsers(true);
                },
                () => {
                    // do nothing.
                },
            );
        });
    }

    private initMainPage(): void {
        const pagePath = this.router.url;
        const pageByUrl = this.currentPages.find(page => page.routerLink === pagePath);
        this.selectedPage = pageByUrl || this.currentPages[0];
    }

    private filterPagesByUserType(): Page[] {
        return this.pages.filter(page => this.authHolderService.hasAnyPermission(page.permissions));
    }

    private initCompanyName(): void {
        this.userService
            .getUserCompany()
            .pipe(
                map(company => company.name),
                takeUntil(this.destroy$),
            )
            .subscribe(companyName => this.companyName$.next(companyName));
    }
}
