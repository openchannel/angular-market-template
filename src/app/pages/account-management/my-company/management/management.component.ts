import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  InviteUserModel,
  InviteUserService,
  ModalUpdateUserModel,
  UserAccount,
  UserAccountGridModel,
  UserAccountService,
  UserAccountTypesService,
  UserGridActionModel,
  UsersGridParametersModel,
  UsersService,
} from 'oc-ng-common-service';
import { Subject, Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { OcConfirmationModalComponent, OcInviteModalComponent } from 'oc-ng-common-component';
import { LoadingBarState } from '@ngx-loading-bar/core/loading-bar.state';
import { LoadingBarService } from '@ngx-loading-bar/core';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss']
})
export class ManagementComponent implements OnInit, OnDestroy {

  userProperties: UsersGridParametersModel = {
    data: {
      pageNumber: 1,
      pages: 50,
      list: [],
      count: 0,
    },
    layout: 'table',
    options: ['DELETE', 'EDIT']
  };

  private subscriptions = new Subscription();
  private sortQuery = '{"name": 1}';

  private destroy$: Subject<void> = new Subject();
  private loader: LoadingBarState;

  constructor(private loadingBar: LoadingBarService,
              private userService: UsersService,
              private inviteUserService: InviteUserService,
              private userAccountService: UserAccountService,
              private toaster: ToastrService,
              private modal: NgbModal,
              private userAccountTypesService: UserAccountTypesService) {
  }

  ngOnInit(): void {
    this.loader = this.loadingBar.useRef();
    this.scroll(1);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  scroll(pageNumber: number) {
    this.userProperties.data.pageNumber = pageNumber;
    this.getAllUsers(() => {
    });
  }

  catchSortChanges(sortBy) {
    switch (sortBy) {
      case 'name':
        this.sortQuery = '{"name": 1}';
        break;
      case 'email':
        this.sortQuery = '{"email": 1}';
        break;
      case 'date':
        this.sortQuery = '{"created": 1}';
        break;
      case 'role':
        this.sortQuery = '{"type": 1}';
        break;
      default:
        break;
    }
    this.userProperties.data.pageNumber = 1;
    this.getAllUsers(() => this.userProperties.data.list = []);
  }

  private getAllUsers(responseCallBack: () => void) {
    this.loader.start();
    this.subscriptions.add(
        this.inviteUserService.getUserInvites(this.userProperties.data.pageNumber, 10, this.sortQuery)
        .subscribe(invites => {
          this.loader.complete();
          this.getActiveUsers(invites.list.map(userInvite => this.mapToGridUserFromInvite(userInvite)), responseCallBack);
        }, () => {
          this.loader.complete();
          this.getActiveUsers([], responseCallBack);
        })
    );
  }

  private getActiveUsers(invites: UserAccountGridModel[], responseCallBack: () => void) {
    this.loader.start();
    this.subscriptions.add(this.userAccountService.getUserAccounts(this.userProperties.data.pageNumber, 10, this.sortQuery)
        .subscribe(activeUsers => {
          responseCallBack();

          // push new invites
          if (this.userProperties.data.pageNumber === 1) {
            this.userProperties.data.list
            .push(...invites);
          } else {
            const lastInvitedDev = this.userProperties.data.list
            .filter(user => user.inviteStatus === 'INVITED').pop();
            if (lastInvitedDev) {
              this.userProperties.data.list
              .splice(this.userProperties.data.list.lastIndexOf(lastInvitedDev) + 1, 0, ...invites);
            }
          }

          // push new users
          this.userProperties.data.list.push(...activeUsers.list.map(user => this.mapToGridUserFromUser(user)));
          this.loader.complete();
        }, () => {
          responseCallBack();
          this.loader.complete();
        })
    );
  }

  private mapToGridUserFromUser(user: UserAccount): UserAccountGridModel {
    return {
      ...user,
      name: user.name,
      email: user.email,
      customData: user.customData,
      userId: user.userId,
      userAccountId: user.userAccountId,
      created: user.created,
      inviteStatus: 'ACTIVE',
    };
  }

  private mapToGridUserFromInvite(user: InviteUserModel): UserAccountGridModel {
    return {
      ...user,
      name: user.name,
      email: user.email,
      customData: user.customData,
      userId: user.userId,
      userAccountId: user.userAccountId,
      created: user.createdDate,
      inviteId: user.userInviteId,
      inviteToken: user.token,
      inviteStatus: 'INVITED'
    };
  }


  userAction(userAction: UserGridActionModel) {
    const user = this.findUserByAction(userAction);
    if (user) {
      switch (userAction.action) {
        case 'DELETE':
          this.deleteUser(userAction, user);
          break;
        case 'EDIT':
          this.editUser(userAction, user);
          break;
        default:
          console.error('Not implement');
      }
    } else {
      console.error('Can\'t find user from mail array by action');
    }
  }

  private findUserByAction(userAction: UserGridActionModel): UserAccountGridModel {
    if (this.userProperties.data.list?.length > 0) {
      if (userAction?.inviteId) {
        return this.userProperties.data.list.filter(developer => developer?.inviteId === userAction.inviteId)[0];
      } else {
        return this.userProperties.data.list.filter(developer => developer?.userAccountId === userAction.userAccountId)[0];
      }
    }
    return null;
  }

  deleteUser(userAction: UserGridActionModel, user: UserAccountGridModel): void {
    if (user?.inviteStatus === 'INVITED') {
      this.deleteInvite(user);
    } else if (user?.inviteStatus === 'ACTIVE') {
      this.deleteAccount(user);
    } else {
      console.error('Not implement edit type : ', user?.inviteStatus);
    }
  }

  deleteInvite(user: UserAccountGridModel): void {
    this.openDeleteModal('Delete invite', 'Are you sure you want to delete this invite?', 'Yes, delete invite',
        () => this.inviteUserService.deleteUserInvite(user?.inviteId).subscribe(() => {
          this.deleteUserFromResultArray(user);
          this.toaster.success('Invite has been deleted');
        }));
  }

  deleteAccount(user: UserAccountGridModel): void {
    this.openDeleteModal('Delete user', 'Delete this user from the marketplace now?', 'Yes, delete user', () =>
        this.userAccountService.deleteUserAccount(user?.userAccountId)
        .subscribe(() => {
          this.deleteUserFromResultArray(user);
          this.toaster.success('User has been deleted from your organization');
        })
    );
  }

  private openDeleteModal(modalTitle: string, modalText: string, confirmText: string, deleteCallback: () => void) {
    const modalSuspendRef = this.modal.open(OcConfirmationModalComponent, {size: 'md'});
    modalSuspendRef.componentInstance.ngbModalRef = modalSuspendRef;
    modalSuspendRef.componentInstance.modalTitle = modalTitle;
    modalSuspendRef.componentInstance.modalText = modalText;
    modalSuspendRef.componentInstance.confirmButtonText = confirmText;
    modalSuspendRef.componentInstance.confirmButtonType = 'danger';
    modalSuspendRef.result.then(result => {
      if (result) {
        deleteCallback();
      }
    });
  }

  private editUser(userAction: UserGridActionModel, user: UserAccountGridModel) {
    const userAccount = {...user};
    if (user?.inviteStatus === 'ACTIVE') {
      this.editUserAccount(userAccount);
    } else {
      console.error('Not implement edit type : ', user?.inviteStatus);
    }
  }

  private editUserAccount(userAccount: UserAccount) {

    const modalRef = this.modal.open(OcInviteModalComponent, {size: 'sm'});
    modalRef.componentInstance.ngbModalRef = modalRef;

    const modalData = new ModalUpdateUserModel();
    modalData.userData = userAccount;
    modalData.modalTitle = 'Edit member';
    modalData.successButtonText = 'Save';

    modalData.requestFindUserTypes = () => {
      return this.userAccountTypesService.getUserAccountTypes(1, 100);
    };

    modalData.requestUpdateAccount = (accountId: string, accountData: any) => {
      return this.userAccountService.updateUserAccountFieldsForAnotherUser(accountId, true, accountData);
    };

    modalRef.componentInstance.modalData = modalData;

    modalRef.result.then(result => {
      if (result) {
        this.toaster.success('User details have been updated');
      }
    });
  }

  private deleteUserFromResultArray(user: UserAccountGridModel) {
    if (this.userProperties.data.list?.length > 0) {
      const userIndex = this.userProperties.data.list.indexOf(user);
      if (userIndex >= 0) {
        this.userProperties.data.list.splice(userIndex, 1);
      }
    }
  }
}
