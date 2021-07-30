import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import {
    AccessLevel,
    AuthHolderService,
    InviteUserService,
    Permission,
    PermissionType,
    UserRoleService,
} from '@openchannel/angular-common-services';
import { ModalInviteUserModel, OcInviteModalComponent } from '@openchannel/angular-common-components';
import { ManagementComponent } from './management/management.component';

export interface Page {
    pageId: string;
    placeholder: string;
    permissions: Permission[];
}

@Component({
    selector: 'app-my-company',
    templateUrl: './my-company.component.html',
    styleUrls: ['./my-company.component.scss'],
})
export class MyCompanyComponent implements OnInit {
    @ViewChild('appManagement') appManagement: ManagementComponent;

    pages: Page[] = [
        {
            pageId: 'company',
            placeholder: 'Company details',
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

    constructor(
        private activatedRoute: ActivatedRoute,
        private modal: NgbModal,
        private toaster: ToastrService,
        private authHolderService: AuthHolderService,
        private userRolesService: UserRoleService,
        private inviteService: InviteUserService,
    ) {}

    ngOnInit(): void {
        this.currentPages = this.filterPagesByUserType();
        this.initMainPage();
    }

    gotoPage(newPage: Page): void {
        this.selectedPage = newPage;
    }

    goBack(): void {
        history.back();
    }

    openInviteModal(): void {
        const modalRef = this.modal.open(OcInviteModalComponent, { size: 'sm' });
        modalRef.componentInstance.ngbModalRef = modalRef;

        const modalData = new ModalInviteUserModel();
        modalData.modalTitle = 'Invite a member';
        modalData.successButtonText = 'Send Invite';

        modalData.requestFindUserRoles = () => {
            return this.userRolesService.getUserRoles(1, 100);
        };

        modalData.requestSendInvite = (accountData: any) => {
            return this.inviteService.sendUserInvite(null, accountData);
        };

        modalRef.componentInstance.modalData = modalData;

        modalRef.result.then(
            () => {
                this.toaster.success('Invitation sent');
                this.appManagement.getAllUsers(true);
            },
            () => {},
        );
    }

    private initMainPage(): void {
        const pageType = this.activatedRoute.snapshot.paramMap.get('pageId');
        if (pageType) {
            const pageByUrl = this.currentPages.filter(page => page.pageId === pageType)[0];
            if (pageByUrl) {
                this.selectedPage = pageByUrl;
            }
        } else {
            this.selectedPage = this.currentPages[0];
        }
    }

    private filterPagesByUserType(): Page[] {
        return this.pages.filter(page => this.authHolderService.hasAnyPermission(page.permissions));
    }
}
