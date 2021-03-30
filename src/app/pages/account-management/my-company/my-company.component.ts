import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import {
  AccessLevel,
  AuthHolderService,
  InviteUserService,
  ModalInviteUserModel,
  Permission,
  PermissionType,
  UserRoleService,
} from 'oc-ng-common-service';
import { OcInviteModalComponent } from 'oc-ng-common-component';
import {ManagementComponent} from './management/management.component';

export interface Page {
  pageId: string;
  pageTitle: string;
  placeholder: string;
  permissions: Permission [];
}

@Component({
  selector: 'app-my-company',
  templateUrl: './my-company.component.html',
  styleUrls: ['./my-company.component.scss']
})
export class MyCompanyComponent implements OnInit {
  @ViewChild('appManagement') appManagement: ManagementComponent;

  pages: Page[] = [{
    pageId: 'company',
    pageTitle: 'My company',
    placeholder: 'Company details',
    permissions: [{
      type: PermissionType.ORGANIZATIONS,
      access: [AccessLevel.MODIFY]
    }]
  }, {
    pageId: 'profile',
    pageTitle: 'My company',
    placeholder: 'User management',
    permissions: [{
      type: PermissionType.ACCOUNTS,
      access: [AccessLevel.MODIFY]
    }],
  }];

  currentPages: Page[] = [];
  selectedPage: Page;

  isProcessing = false;

  constructor(
      private activatedRoute: ActivatedRoute,
      private modal: NgbModal,
      private toaster: ToastrService,
      private authHolderService: AuthHolderService,
      private userRolesService: UserRoleService,
      private inviteService: InviteUserService) {
  }

  ngOnInit(): void {
    this.currentPages = this.filterPagesByUserType();
    this.initMainPage();
  }

  gotoPage(newPage: Page) {
    this.selectedPage = newPage;
  }

  goBack() {
    history.back();
  }

  private initMainPage() {
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

  private filterPagesByUserType(): Page [] {
    return this.currentPages = this.pages.filter(page => this.authHolderService.hasAnyPermission(page.permissions));
  }

  openInviteModal() {

    const inviteTemplateId = '5fc663f2217876017548dc25';

    const modalRef = this.modal.open(OcInviteModalComponent, {size: 'sm'});
    modalRef.componentInstance.ngbModalRef = modalRef;

    const modalData = new ModalInviteUserModel();
    modalData.modalTitle = 'Invite a member';
    modalData.successButtonText = 'Send Invite';

    modalData.requestFindUserRoles = () => {
      return this.userRolesService.getUserRoles(1, 100)
    };

    modalData.requestSendInvite = (accountData: any) => {
      return this.inviteService.sendUserInvite(inviteTemplateId, null, accountData);
    };

    modalRef.componentInstance.modalData = modalData;

    modalRef.result.then(result => {
      if (result) {
        this.toaster.success('Invitation sent');
        this.appManagement.getAllUsers(true);
      }
    });
  }
}
